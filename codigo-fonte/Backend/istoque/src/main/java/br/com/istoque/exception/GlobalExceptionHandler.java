package br.com.istoque.exception;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.exc.InvalidFormatException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(EmpresaNaoEncontradaException.class)
    public ResponseEntity<ApiErrorResponse> tratarEmpresaNaoEncontrada(EmpresaNaoEncontradaException ex) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ApiErrorResponse.de(HttpStatus.NOT_FOUND.value(), ex.getMessage()));
    }

    @ExceptionHandler(CnpjJaCadastradoException.class)
    public ResponseEntity<ApiErrorResponse> tratarCnpjJaCadastrado(CnpjJaCadastradoException ex) {
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(ApiErrorResponse.de(HttpStatus.CONFLICT.value(), ex.getMessage()));
    }

    @ExceptionHandler(PerfilNaoEncontradoException.class)
    public ResponseEntity<ApiErrorResponse> tratarPerfilNaoEncontrado(PerfilNaoEncontradoException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiErrorResponse.de(HttpStatus.BAD_REQUEST.value(), ex.getMessage()));
    }

    @ExceptionHandler(UsuarioNaoEncontradoException.class)
    public ResponseEntity<ApiErrorResponse> tratarUsuarioNaoEncontrado(UsuarioNaoEncontradoException ex) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ApiErrorResponse.de(HttpStatus.NOT_FOUND.value(), ex.getMessage()));
    }

    @ExceptionHandler(EmailJaCadastradoException.class)
    public ResponseEntity<ApiErrorResponse> tratarEmailJaCadastrado(EmailJaCadastradoException ex) {
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(ApiErrorResponse.de(HttpStatus.CONFLICT.value(), ex.getMessage()));
    }

    @ExceptionHandler(ProdutoNaoEncontradoException.class)
    public ResponseEntity<ApiErrorResponse> tratarProdutoNaoEncontrado(ProdutoNaoEncontradoException ex) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ApiErrorResponse.de(HttpStatus.NOT_FOUND.value(), ex.getMessage()));
    }

    @ExceptionHandler(CategoriaNaoEncontradaException.class)
    public ResponseEntity<ApiErrorResponse> tratarCategoriaNaoEncontrada(CategoriaNaoEncontradaException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiErrorResponse.de(HttpStatus.BAD_REQUEST.value(), ex.getMessage()));
    }

    @ExceptionHandler(UnidadeMedidaNaoEncontradaException.class)
    public ResponseEntity<ApiErrorResponse> tratarUnidadeMedidaNaoEncontrada(UnidadeMedidaNaoEncontradaException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiErrorResponse.de(HttpStatus.BAD_REQUEST.value(), ex.getMessage()));
    }

    // e-mail ou senha errados, ou usuário desativado (HT003): sempre a mesma resposta
    @ExceptionHandler(CredenciaisInvalidasException.class)
    public ResponseEntity<ApiErrorResponse> tratarCredenciaisInvalidas(CredenciaisInvalidasException ex) {
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ApiErrorResponse.de(HttpStatus.UNAUTHORIZED.value(), ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> tratarValidacao(MethodArgumentNotValidException ex) {
        Map<String, String> campos = new HashMap<>();
        for (FieldError erro : ex.getBindingResult().getFieldErrors()) {
            campos.put(erro.getField(), erro.getDefaultMessage());
        }
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiErrorResponse.deValidacao(
                        HttpStatus.BAD_REQUEST.value(),
                        "Dados inválidos",
                        campos));
    }

    // JSON mal formatado, corpo ausente ou valor com tipo errado (ex.: "tipo": "xyz", "empresaId": "abc")
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiErrorResponse> tratarCorpoInvalido(HttpMessageNotReadableException ex) {
        if (ex.getCause() instanceof InvalidFormatException invalido) {
            String campo = invalido.getPath().stream()
                    .map(JacksonException.Reference::getPropertyName)
                    .filter(Objects::nonNull)
                    .collect(Collectors.joining("."));
            Class<?> tipo = invalido.getTargetType();
            String mensagem = tipo.isEnum()
                    ? "Valor inválido. Valores aceitos: " + Arrays.stream(tipo.getEnumConstants())
                            .map(Object::toString)
                            .collect(Collectors.joining(", "))
                    : "Valor em formato inválido";
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiErrorResponse.deValidacao(
                            HttpStatus.BAD_REQUEST.value(),
                            "Dados inválidos",
                            Map.of(campo, mensagem)));
        }
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiErrorResponse.de(
                        HttpStatus.BAD_REQUEST.value(),
                        "O corpo da requisição está ausente ou mal formatado"));
    }

    // parâmetro da URL com tipo errado (ex.: /api/produtos/abc)
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiErrorResponse> tratarParametroInvalido(MethodArgumentTypeMismatchException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiErrorResponse.de(
                        HttpStatus.BAD_REQUEST.value(),
                        "Valor inválido para o parâmetro '" + ex.getName() + "': " + ex.getValue()));
    }

    // parâmetro obrigatório ausente na URL (ex.: /api/perfis sem ?empresaId=)
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiErrorResponse> tratarParametroAusente(MissingServletRequestParameterException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiErrorResponse.de(
                        HttpStatus.BAD_REQUEST.value(),
                        "O parâmetro '" + ex.getParameterName() + "' é obrigatório"));
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiErrorResponse> tratarMetodoNaoSuportado(HttpRequestMethodNotSupportedException ex) {
        return ResponseEntity
                .status(HttpStatus.METHOD_NOT_ALLOWED)
                .body(ApiErrorResponse.de(
                        HttpStatus.METHOD_NOT_ALLOWED.value(),
                        "Método " + ex.getMethod() + " não é suportado para esta rota"));
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ApiErrorResponse> tratarRotaNaoEncontrada(NoResourceFoundException ex) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ApiErrorResponse.de(
                        HttpStatus.NOT_FOUND.value(),
                        "Rota não encontrada: /" + ex.getResourcePath()));
    }

    // o cliente recebe a mensagem genérica; a restrição que falhou fica só no log
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiErrorResponse> tratarIntegridade(DataIntegrityViolationException ex) {
        log.warn("Violação de integridade dos dados: {}", ex.getMostSpecificCause().getMessage());
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(ApiErrorResponse.de(
                        HttpStatus.CONFLICT.value(),
                        "A operação viola uma restrição de integridade dos dados"));
    }

    // o cliente recebe a mensagem genérica; a exceção completa fica só no log
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> tratarErroGenerico(Exception ex) {
        log.error("Erro inesperado ao processar a requisição", ex);
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiErrorResponse.de(
                        HttpStatus.INTERNAL_SERVER_ERROR.value(),
                        "Ocorreu um erro inesperado. Tente novamente mais tarde."));
    }

    @ExceptionHandler(SenhaAtualIncorretaException.class)
    public ResponseEntity<ApiErrorResponse> tratarSenhaAtualIncorreta(SenhaAtualIncorretaException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiErrorResponse.de(HttpStatus.BAD_REQUEST.value(), ex.getMessage()));
    }
}
