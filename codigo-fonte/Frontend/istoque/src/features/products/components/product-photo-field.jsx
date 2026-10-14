import React, { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button.jsx";
import { Icon } from "@/components/ui/icon.jsx";
import {
  IMAGE_TYPES,
  imageFileError,
  readImageFile,
} from "../utils/image-file.js";

// Foto opcional do produto (RF-34), lida no navegador. localOnly: com login,
// avisa que a foto ainda não é gravada no servidor.
export function ProductPhotoField({ value, localOnly, onChange, onPending }) {
  const input = useRef(null);
  // Cada leitura de arquivo recebe um número; leituras que terminam depois de
  // outra escolha, da remoção da foto ou do fechamento do modal são ignoradas.
  const request = useRef(0);
  const hintId = useId();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(
    () => () => {
      request.current++;
    },
    [],
  );

  async function choose(file) {
    if (!file) return;
    const current = ++request.current;
    setError("");
    setLoading(false);
    onPending(false);
    const invalid = imageFileError(file);
    if (invalid) {
      setError(invalid);
      return;
    }
    setLoading(true);
    onPending(true);
    let photo = "";
    let message = "";
    try {
      photo = await readImageFile(file);
    } catch (e) {
      message = e.message;
    }
    if (current !== request.current) return;
    if (photo) onChange(photo);
    setError(message);
    setLoading(false);
    onPending(false);
  }

  return (
    <section className="photo-field" aria-labelledby={hintId + "-label"}>
      <div className="photo-label" id={hintId + "-label"}>
        Foto do produto <span>(opcional)</span>
      </div>
      <div className="photo-editor">
        <div className="photo-preview">
          {value ? (
            <img src={value} alt="Prévia da foto do produto" />
          ) : (
            <Icon name="box" size={32} />
          )}
        </div>
        <div className="photo-controls">
          <input
            ref={input}
            type="file"
            className="visually-hidden"
            tabIndex={-1}
            aria-label="Foto do produto"
            aria-describedby={hintId}
            accept={IMAGE_TYPES.join(",")}
            onChange={(event) => {
              choose(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
          <Button
            type="button"
            variant="secondary"
            icon="upload"
            onClick={() => input.current?.click()}
            disabled={loading}
          >
            {loading
              ? "Carregando imagem…"
              : value
                ? "Substituir foto"
                : "Adicionar foto"}
          </Button>
          {value && (
            <button
              className="text-button remove-photo"
              type="button"
              onClick={() => {
                request.current++;
                onChange("");
                setError("");
                setLoading(false);
                onPending(false);
              }}
            >
              Remover foto
            </button>
          )}
          <small id={hintId}>
            JPG, PNG ou WebP · até 5 MB.
            <br />
            Sem foto, será usada a ilustração padrão.
            {localOnly && (
              <>
                <br />A foto ainda não é gravada no servidor: vale até
                recarregar a página.
              </>
            )}
          </small>
        </div>
      </div>
      {error && (
        <p className="error-text photo-error" role="alert">
          {error}
        </p>
      )}
      <span className="visually-hidden" role="status">
        {loading
          ? "Carregando imagem"
          : value
            ? "Foto pronta para salvar"
            : "Produto sem foto"}
      </span>
    </section>
  );
}
