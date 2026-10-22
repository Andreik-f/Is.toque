# Introdução

O gerenciamento de estoque faz parte da rotina de restaurantes, lanchonetes e pequenos estabelecimentos alimentícios. Nesses negócios, produtos e insumos são recebidos, armazenados e utilizados no preparo de diferentes receitas, enquanto também podem ocorrer perdas, descartes e divergências entre as quantidades registradas e as disponíveis fisicamente.

Quando essas informações ficam dispersas em anotações, planilhas ou registros que não acompanham a produção, o responsável pelo estabelecimento pode ter dificuldade para identificar o saldo de cada produto, acompanhar a validade dos alimentos e planejar reposições. Além de conhecer a quantidade de cada ingrediente, é necessário entender quais preparações podem ser produzidas com o estoque existente.

Nesse contexto, o IS.TOQUE tem como proposta integrar o controle de estoque ao gerenciamento de receitas e ao registro da produção. O projeto concentra-se no controle interno dos produtos e insumos, relacionando sua disponibilidade às quantidades necessárias para cada preparação e oferecendo informações para o acompanhamento das movimentações e das perdas.

## Problema

O problema abordado pelo projeto é a dificuldade de manter informações atualizadas e integradas sobre os insumos disponíveis e sua utilização na produção de alimentos. O controle isolado das quantidades de cada produto não permite determinar diretamente quantas unidades de uma receita podem ser preparadas, pois essa capacidade depende da disponibilidade de todos os ingredientes envolvidos.

Por exemplo, um estabelecimento pode possuir pães e hambúrgueres suficientes para preparar vinte sanduíches, mas queijo para apenas oito. Nesse caso, a quantidade de queijo limita a produção, mesmo que os demais ingredientes estejam disponíveis em maior quantidade. Quando essa relação é conferida manualmente, o planejamento exige verificações adicionais e pode se basear em uma disponibilidade maior do que a real.

Outra dificuldade ocorre quando o consumo dos ingredientes não é registrado junto com a produção. A retirada de vários produtos para uma mesma receita pode deixar de ser anotada ou ser registrada de forma incompleta, provocando diferenças entre o estoque físico e o registrado. Sem histórico e identificação das operações, também se torna mais difícil compreender a origem dessas diferenças e acompanhar perdas, descartes e ajustes.

Essas situações podem resultar em falta de ingredientes durante o preparo, compras desnecessárias, acúmulo de produtos e aproveitamento inadequado de alimentos próximos do vencimento. A necessidade central é relacionar estoque, composição das receitas e produção, permitindo que os responsáveis saibam o que está disponível, o que pode ser produzido e quais itens precisam de reposição.

## Objetivos

### Objetivo Geral

Desenvolver um sistema de gerenciamento de estoque destinado a restaurantes e pequenos negócios, integrando o controle de produtos, insumos, movimentações, receitas e produção, com o objetivo de apoiar o planejamento de reposições, o acompanhamento do consumo e a identificação de perdas e desperdícios.

### Objetivos Específicos

a) Permitir o cadastro e a organização de empresas, usuários, produtos e insumos utilizados pelo estabelecimento;

b) Permitir o gerenciamento de usuários com diferentes perfis e níveis de acesso;

c) Controlar as entradas e saídas de produtos do estoque;

d) Permitir o acompanhamento da quantidade disponível de cada produto, respeitando sua unidade de medida;

e) Permitir o estabelecimento de níveis mínimos e máximos de estoque;

f) Identificar produtos com quantidade igual ou inferior ao estoque mínimo estabelecido;

g) Registrar o histórico das movimentações, incluindo quantidade, data e usuário responsável;

h) Permitir o registro de perdas, descartes e ajustes de estoque, com justificativa nos casos aplicáveis;

i) Permitir o cadastro de receitas com produtos previamente registrados e com a quantidade de cada ingrediente necessária para produzir uma unidade;

j) Calcular a quantidade máxima de unidades de uma receita que pode ser produzida com base na disponibilidade atual dos ingredientes;

k) Identificar os produtos que limitam a capacidade de produção de uma receita;

l) Permitir o registro da quantidade produzida e realizar automaticamente a baixa conjunta dos ingredientes utilizados;

m) Atualizar a capacidade de produção das receitas após alterações no estoque;

n) Auxiliar o estabelecimento no planejamento de compras e reposição de produtos;

o) Disponibilizar informações por período para acompanhar movimentações, consumo e perdas de estoque;

p) Permitir o acompanhamento da validade dos produtos sujeitos a esse controle, identificando itens próximos do vencimento ou vencidos.

## Justificativa

A escolha do tema se justifica pela relação entre o controle dos insumos e a organização da produção em pequenos estabelecimentos alimentícios. Informações atualizadas sobre quantidades, movimentações e validade podem apoiar decisões de compra e preparo, além de permitir o acompanhamento dos produtos que deixam de estar disponíveis por perdas ou descartes.

A dimensão do desperdício de alimentos reforça a relevância do tema. Segundo o [Programa das Nações Unidas para o Meio Ambiente — PNUMA (2024)](https://brasil.un.org/pt-br/264460-%C3%ADndice-de-desperd%C3%ADcio-de-alimentos-2024), foram gerados aproximadamente 1,05 bilhão de toneladas de resíduos alimentares no mundo em 2022, incluindo partes não comestíveis. Desse total, 28% tiveram origem nos serviços de alimentação. O levantamento tem abrangência mundial e serve como contextualização da importância de acompanhar o uso e o desperdício de alimentos no setor.

A relação entre receitas e estoque também encontra apoio nas orientações do [Sebrae, na ficha de serviço “Elaboração de cardápio e/ou fichas técnicas para segmentos de alimentação”](https://portfolio-sebraetec.sebrae.com.br/fichas/14062-9--elaboracao-de-cardapio-e-ou-fichas-tecnicas-para-segmentos-de-alimentacao). A instituição apresenta a estimativa de uso dos ingredientes, a melhoria do controle de estoque e a prevenção do desperdício entre os benefícios esperados dessa organização. A ficha técnica reúne informações sobre os ingredientes, as unidades e as quantidades utilizadas em cada preparação.

Com base nesse contexto, o diferencial proposto pelo IS.TOQUE é associar a composição das receitas ao saldo dos ingredientes, possibilitando calcular a capacidade de produção e registrar o consumo de vários insumos em uma mesma operação. Espera-se, assim, oferecer apoio ao planejamento e tornar mais organizado o acompanhamento das movimentações. A redução de perdas constitui um resultado esperado, a ser avaliado durante a utilização do sistema.

No âmbito acadêmico, o projeto permite aplicar os conhecimentos de análise de requisitos, modelagem de dados, desenvolvimento de interfaces e implementação de regras de negócio a um problema de gestão. A conexão entre estoque e produção orienta o desenvolvimento de uma solução alinhada às atividades do público-alvo.

## Público-Alvo

O público-alvo principal do IS.TOQUE é formado por restaurantes, lanchonetes, bares e outros pequenos estabelecimentos alimentícios que precisam controlar produtos e insumos utilizados em preparações. A proposta também contempla pequenos negócios com rotinas semelhantes de consumo de matérias-primas e registro de produção.

Os usuários previstos são proprietários, administradores, gerentes e funcionários que atuam no recebimento, armazenamento, reposição e utilização dos produtos. Os proprietários e gerentes necessitam de uma visão do estoque, das perdas e das necessidades de compra; os administradores organizam os usuários e seus níveis de acesso; e os funcionários registram as operações de estoque e produção conforme suas responsabilidades.

O projeto é direcionado especialmente a estabelecimentos que necessitam reunir essas informações em um mesmo ambiente e relacionar a disponibilidade dos ingredientes à capacidade de produzir suas receitas.
