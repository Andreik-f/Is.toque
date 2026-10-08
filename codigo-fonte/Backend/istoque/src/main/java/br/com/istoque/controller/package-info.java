/**
 * Camada de entrada da API REST (classes anotadas com {@code @RestController}).
 * Recebe as requisições HTTP, delega o processamento para {@code services} e devolve a resposta.
 * Não deve conter regra de negócio nem acessar os repositórios diretamente.
 */
package br.com.istoque.controller;
