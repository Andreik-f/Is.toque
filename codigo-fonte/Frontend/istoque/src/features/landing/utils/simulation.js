// Dia de cozinha simulado no painel da página inicial: cada quadro é uma
// movimentação e o estoque que fica depois dela. Porção, máximo e saldo
// estão na unidade base (un ou g).
export const RECIPE = [
  { key: "pao", name: "Pão de hambúrguer", unit: "un", portion: 1, max: 40 },
  {
    key: "carne",
    name: "Carne bovina moída",
    unit: "g",
    portion: 150,
    max: 5000,
  },
  { key: "queijo", name: "Queijo muçarela", unit: "g", portion: 40, max: 1500 },
  { key: "tomate", name: "Tomate italiano", unit: "g", portion: 50, max: 2500 },
  {
    key: "alface",
    name: "Alface americana",
    unit: "g",
    portion: 20,
    max: 1500,
  },
];

const morning = {
  pao: 36,
  carne: 4500,
  queijo: 1200,
  tomate: 600,
  alface: 600,
};
const afterFive = {
  pao: 31,
  carne: 3750,
  queijo: 1000,
  tomate: 350,
  alface: 500,
};
const afterTen = {
  pao: 21,
  carne: 2250,
  queijo: 600,
  tomate: 1850,
  alface: 300,
};

export const FRAMES = [
  {
    type: "Novo dia",
    title: "Contagem da manhã conferida",
    amount: "5 itens",
    stock: morning,
  },
  {
    type: "Produção",
    title: "Hambúrguer da casa",
    amount: "5 porções",
    stock: afterFive,
  },
  {
    type: "Alerta",
    title: "Tomate italiano abaixo do mínimo",
    amount: "0,35 kg",
    stock: afterFive,
  },
  {
    type: "Entrada",
    title: "Tomate italiano",
    amount: "+2 kg",
    stock: { ...afterFive, tomate: 2350 },
  },
  {
    type: "Produção",
    title: "Hambúrguer da casa",
    amount: "10 porções",
    stock: afterTen,
  },
  {
    type: "Perda",
    title: "Alface americana",
    amount: "−0,1 kg",
    stock: { ...afterTen, alface: 200 },
  },
  {
    type: "Entrada",
    title: "Alface americana",
    amount: "+1 kg",
    stock: { ...afterTen, alface: 1200 },
  },
];

// [fundo do selo, cor do texto]; a bolinha do histórico usa a cor do texto.
const TYPE_COLORS = {
  Entrada: ["#DFF5E9", "#277957"],
  Produção: ["#E4EFEB", "#164D4E"],
  Perda: ["#FFE2DC", "#B64232"],
  Alerta: ["#FFF0CA", "#875800"],
  Saída: ["#F0EDE6", "#5E5751"],
  "Novo dia": ["#F0EDE6", "#5E5751"],
};

export const FRAME_INTERVAL = 2800;

// "36 un"; gramas viram kg com até duas casas ("0,35 kg").
export function formatAmount(value, unit) {
  if (unit === "un") return value + " un";
  return (
    (value / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 2 }) + " kg"
  );
}

export const capacityLabel = (capacity) =>
  capacity === 1 ? "porção disponível" : "porções disponíveis";

function movement(frame) {
  const [background, color] = TYPE_COLORS[frame.type];
  return {
    type: frame.type,
    title: frame.title,
    amount: frame.amount,
    background,
    color,
  };
}

// Tudo o que o painel mostra no quadro `step`. O limitante é o primeiro
// ingrediente da receita que rende só a capacidade.
export function frameState(step) {
  const total = FRAMES.length;
  const index = ((step % total) + total) % total;
  const frame = FRAMES[index];
  const rows = RECIPE.map((item) => {
    const stock = frame.stock[item.key];
    return { ...item, stock, yields: Math.floor(stock / item.portion) };
  });
  const capacity = Math.min(...rows.map((row) => row.yields));
  const limiting = rows.find((row) => row.yields === capacity);
  return {
    index,
    current: movement(frame),
    history: [1, 2, 3].map((k) =>
      movement(FRAMES[(index - k + total) % total]),
    ),
    capacity,
    capacityLabel: capacityLabel(capacity),
    limiting: limiting.name,
    ingredients: rows.map((row) => ({
      key: row.key,
      name: row.name,
      portionText: formatAmount(row.portion, row.unit),
      stockText: formatAmount(row.stock, row.unit),
      yieldsText: "rende " + row.yields,
      fill: Math.min(1, row.stock / row.max),
      limiting: row.key === limiting.key,
    })),
  };
}
