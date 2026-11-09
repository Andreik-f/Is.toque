const painel = "//section[contains(@class,'company-phone')]";

const telefoneEmpresaLocators = {
    campoTelefone: `${painel}//form[contains(@class,'company-phone-form')]//input[@name='telefone']`,
    campoCodigo: `${painel}//input[@name='codigo']`,
    dicaTelefone: `${painel}//form[contains(@class,'company-phone-form')]//small`,
    selo: `${painel}//span[contains(@class,'badge')]`,
    alerta: `${painel}//p[@role='alert']`,
    botaoContagem: `${painel}//button[starts-with(normalize-space(),'Enviar novo código em')]`,
    getBotao(nomeBotao) {
        return `${painel}//button[normalize-space()='${nomeBotao}']`;
    },
};

export default telefoneEmpresaLocators;
