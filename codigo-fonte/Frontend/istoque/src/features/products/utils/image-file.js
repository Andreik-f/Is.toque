// Foto do produto (RF-34): formatos e tamanho aceitos e leitura no navegador.
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

// Mensagem de erro do arquivo escolhido, ou "" se ele pode ser lido.
export function imageFileError(file) {
  if (!IMAGE_TYPES.includes(file.type))
    return "Formato não aceito. Escolha uma imagem JPG, PNG ou WebP.";
  if (file.size > MAX_IMAGE_BYTES)
    return "A imagem ultrapassa 5 MB. Escolha um arquivo menor.";
  return "";
}

// Lê o arquivo e confere que o navegador consegue abri-lo como imagem.
// Devolve o endereço de dados (data URL); se falhar, lança um Error com a
// mensagem para mostrar na tela.
export function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () =>
      reject(new Error("Não foi possível ler a imagem. Tente outro arquivo."));
    reader.onload = () => {
      const url = String(reader.result);
      const image = new Image();
      image.onload = () =>
        image.naturalWidth && image.naturalHeight
          ? resolve(url)
          : reject(new Error("A imagem está inválida. Escolha outro arquivo."));
      image.onerror = () =>
        reject(
          new Error(
            "A imagem está inválida ou corrompida. Escolha outro arquivo.",
          ),
        );
      image.src = url;
    };
    reader.readAsDataURL(file);
  });
}
