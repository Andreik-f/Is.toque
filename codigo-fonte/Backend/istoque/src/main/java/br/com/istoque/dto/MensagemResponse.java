package br.com.istoque.dto;

/**
 * Resposta simples com uma mensagem de texto, usada em ações que não
 * precisam devolver os dados de uma entidade (ex.: exclusão).
 */
public record MensagemResponse(String mensagem) {
}
