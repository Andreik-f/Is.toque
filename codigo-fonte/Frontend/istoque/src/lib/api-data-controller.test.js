import test from "node:test";
import assert from "node:assert/strict";
import { ApiError } from "./api-client.js";
import {
  createApiDataController,
  createApiDataSource,
  ESTADO_CARREGANDO,
  ESTADO_SEM_DADOS,
} from "./api-data-controller.js";

const pendente = () => {
  let resolver;
  let rejeitador;
  const promessa = new Promise((resolve, reject) => {
    resolver = resolve;
    rejeitador = reject;
  });
  return { promessa, resolver, rejeitador };
};

test("começa carregando, sem dados e sem erro", () => {
  const controller = createApiDataController(async () => []);
  assert.deepEqual(controller.getState(), {
    data: null,
    loading: true,
    error: "",
  });
});

test("busca com sucesso guarda os dados e encerra o carregamento", async () => {
  const controller = createApiDataController(async () => [{ id: 1 }]);
  await controller.load();
  assert.deepEqual(controller.getState(), {
    data: [{ id: 1 }],
    loading: false,
    error: "",
  });
});

test("getState devolve o mesmo objeto enquanto nada muda", async () => {
  const controller = createApiDataController(async () => 1);
  await controller.load();
  assert.equal(controller.getState(), controller.getState());
});

test("avisa quem assinou a cada mudança e para depois de cancelar a assinatura", async () => {
  const controller = createApiDataController(async () => 1);
  let avisos = 0;
  const cancelar = controller.subscribe(() => {
    avisos += 1;
  });
  await controller.load();
  assert.equal(avisos, 2);
  cancelar();
  await controller.reload();
  assert.equal(avisos, 2);
});

test("erro da API com campos usa a mensagem dos campos", async () => {
  const controller = createApiDataController(async () => {
    throw new ApiError("Dados inválidos", {
      status: 400,
      fields: { nome: "Nome obrigatório", unidade: "Unidade inválida" },
    });
  });
  await controller.load();
  assert.equal(
    controller.getState().error,
    "Nome obrigatório Unidade inválida",
  );
  assert.equal(controller.getState().loading, false);
  assert.equal(controller.getState().data, null);
});

test("erro da API sem campos usa a mensagem geral", async () => {
  const controller = createApiDataController(async () => {
    throw new ApiError("A API recusou a requisição (erro 404).", {
      status: 404,
    });
  });
  await controller.load();
  assert.equal(
    controller.getState().error,
    "A API recusou a requisição (erro 404).",
  );
});

test("erro de rede mostra a mensagem de conexão", async () => {
  const controller = createApiDataController(async () => {
    throw new ApiError(
      "Não foi possível conectar ao servidor. Verifique se a API está no ar.",
    );
  });
  await controller.load();
  assert.match(controller.getState().error, /Não foi possível conectar/);
});

test("erro que não é da API vira a mensagem padrão", async () => {
  const controller = createApiDataController(async () => {
    throw undefined;
  });
  await controller.load();
  assert.equal(controller.getState().error, "Algo deu errado. Tente de novo.");
});

test("reload mantém os dados antigos e marca carregando até a resposta", async () => {
  const respostas = [pendente(), pendente()];
  let chamada = 0;
  const controller = createApiDataController(
    () => respostas[chamada++].promessa,
  );
  const primeira = controller.load();
  respostas[0].resolver(["antigo"]);
  await primeira;
  const segunda = controller.reload();
  assert.deepEqual(controller.getState(), {
    data: ["antigo"],
    loading: true,
    error: "",
  });
  respostas[1].resolver(["novo"]);
  await segunda;
  assert.deepEqual(controller.getState(), {
    data: ["novo"],
    loading: false,
    error: "",
  });
});

test("reload depois de um erro limpa o erro", async () => {
  const respostas = [
    () => Promise.reject(new ApiError("API fora do ar")),
    () => Promise.resolve(["ok"]),
  ];
  let chamada = 0;
  const controller = createApiDataController(() => respostas[chamada++]());
  await controller.load();
  assert.equal(controller.getState().error, "API fora do ar");
  const recarga = controller.reload();
  assert.equal(controller.getState().error, "");
  await recarga;
  assert.deepEqual(controller.getState(), {
    data: ["ok"],
    loading: false,
    error: "",
  });
});

test("erro no reload mantém os dados antigos", async () => {
  const respostas = [
    () => Promise.resolve(["antigo"]),
    () => Promise.reject(new ApiError("API fora do ar")),
  ];
  let chamada = 0;
  const controller = createApiDataController(() => respostas[chamada++]());
  await controller.load();
  await controller.reload();
  assert.deepEqual(controller.getState().data, ["antigo"]);
  assert.equal(controller.getState().error, "API fora do ar");
});

test("duas buscas em ordem inversa: a resposta da antiga é descartada", async () => {
  const respostas = [pendente(), pendente()];
  let chamada = 0;
  const controller = createApiDataController(
    () => respostas[chamada++].promessa,
  );
  const antiga = controller.load();
  const recente = controller.reload();
  respostas[1].resolver("recente");
  await recente;
  respostas[0].resolver("antiga");
  await antiga;
  assert.deepEqual(controller.getState(), {
    data: "recente",
    loading: false,
    error: "",
  });
});

test("erro de uma busca antiga também é descartado", async () => {
  const respostas = [pendente(), pendente()];
  let chamada = 0;
  const controller = createApiDataController(
    () => respostas[chamada++].promessa,
  );
  const antiga = controller.load();
  const recente = controller.reload();
  respostas[1].resolver("recente");
  await recente;
  respostas[0].rejeitador(new ApiError("falha antiga"));
  await antiga;
  assert.equal(controller.getState().error, "");
  assert.equal(controller.getState().data, "recente");
});

test("dispose antes da resposta: nada é gravado nem avisado", async () => {
  const resposta = pendente();
  const controller = createApiDataController(() => resposta.promessa);
  let avisos = 0;
  controller.subscribe(() => {
    avisos += 1;
  });
  const busca = controller.load();
  const antes = controller.getState();
  controller.dispose();
  resposta.resolver("tarde");
  await busca;
  assert.equal(controller.getState(), antes);
  assert.equal(avisos, 1);
});

test("dispose antes da resposta com erro: nada é gravado", async () => {
  const resposta = pendente();
  const controller = createApiDataController(() => resposta.promessa);
  const busca = controller.load();
  const antes = controller.getState();
  controller.dispose();
  resposta.rejeitador(new ApiError("falha"));
  await busca;
  assert.equal(controller.getState(), antes);
});

test("depois de dispose, load e reload não chamam o fetcher", async () => {
  let chamadas = 0;
  const controller = createApiDataController(async () => {
    chamadas += 1;
  });
  controller.dispose();
  await controller.load();
  await controller.reload();
  assert.equal(chamadas, 0);
});

test("enabled:false não chama o fetcher e devolve estado vazio sem carregar", async () => {
  let chamadas = 0;
  const source = createApiDataSource(
    async () => {
      chamadas += 1;
    },
    { enabled: false },
  );
  await source.load();
  await source.reload();
  assert.equal(chamadas, 0);
  assert.deepEqual(source.getState(), {
    data: null,
    loading: false,
    error: "",
  });
  assert.equal(source.getState(), source.getState());
  assert.equal(source.getState(), ESTADO_SEM_DADOS);
});

test("enabled:false aceita assinar e descartar sem avisos", () => {
  const source = createApiDataSource(async () => 1, { enabled: false });
  const cancelar = source.subscribe(() => assert.fail("não deve avisar"));
  cancelar();
  source.dispose();
});

test("enabled:false e depois true gera um controlador novo que busca", async () => {
  let chamadas = 0;
  const fetcher = async () => {
    chamadas += 1;
    return ["a"];
  };
  const inerte = createApiDataSource(fetcher, { enabled: false });
  await inerte.load();
  assert.equal(chamadas, 0);
  const ativo = createApiDataSource(fetcher, { enabled: true });
  assert.notEqual(ativo, inerte);
  await ativo.load();
  assert.equal(chamadas, 1);
  assert.deepEqual(ativo.getState(), {
    data: ["a"],
    loading: false,
    error: "",
  });
});

test("enabled padrão é true", async () => {
  let chamadas = 0;
  const source = createApiDataSource(async () => {
    chamadas += 1;
  });
  await source.load();
  assert.equal(chamadas, 1);
});

test("dispose do source descarta a resposta pendente", async () => {
  const resposta = pendente();
  const source = createApiDataSource(() => resposta.promessa);
  const busca = source.load();
  const antes = source.getState();
  source.dispose();
  resposta.resolver("tarde");
  await busca;
  assert.equal(source.getState(), antes);
  assert.equal(source.getState().data, null);
});

test("montar, descartar e montar de novo (StrictMode): o segundo source carrega", async () => {
  let chamadas = 0;
  const fetcher = async () => {
    chamadas += 1;
    return "ok";
  };
  const primeiro = createApiDataSource(fetcher);
  const busca = primeiro.load();
  primeiro.dispose();
  await busca;
  const segundo = createApiDataSource(fetcher);
  await segundo.load();
  assert.notEqual(segundo, primeiro);
  assert.equal(chamadas, 2);
  assert.deepEqual(segundo.getState(), {
    data: "ok",
    loading: false,
    error: "",
  });
  assert.equal(primeiro.getState().data, null);
});

test("estados constantes são congelados e estáveis", () => {
  assert.ok(Object.isFrozen(ESTADO_SEM_DADOS));
  assert.ok(Object.isFrozen(ESTADO_CARREGANDO));
  assert.deepEqual(ESTADO_CARREGANDO, { data: null, loading: true, error: "" });
});
