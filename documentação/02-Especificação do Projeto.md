# Especificação do Projeto

## Visão Geral da Solução

O sistema será desenvolvido para auxiliar restaurantes e pequenos negócios no gerenciamento de seus estoques, permitindo centralizar informações relacionadas aos produtos, movimentações, receitas e produção em uma única plataforma.

A utilização do sistema será organizada a partir do cadastro de uma empresa. Cada empresa possuirá uma estrutura própria de dados, usuários e configurações, permitindo que diferentes organizações utilizem o sistema sem que seus dados sejam compartilhados entre si.

Após o cadastro da empresa, deverá ser criado um usuário administrador responsável pela configuração inicial da organização. O sistema deverá permitir que esse administrador cadastre outros usuários e atribua diferentes perfis e níveis de acesso de acordo com as responsabilidades de cada pessoa dentro do estabelecimento.

Cada usuário deverá possuir credenciais individuais para autenticação no sistema. O acesso aos recursos deverá ser determinado pelas permissões associadas ao perfil do usuário, permitindo restringir operações administrativas e outras funcionalidades de acordo com o nível de autorização.

O sistema deverá permitir o cadastro e a organização dos produtos utilizados pelo estabelecimento. Cada produto poderá possuir informações como nome, categoria, unidade de medida, quantidade disponível, estoque mínimo, estoque máximo e, quando aplicável, informações relacionadas à validade.

As movimentações de estoque deverão ser registradas de forma individualizada, permitindo identificar entradas e saídas de produtos. As entradas poderão ocorrer devido a compras, reposições ou outros motivos, enquanto as saídas poderão ocorrer devido a vendas, consumo, produção, perdas, descartes ou ajustes.

A quantidade disponível de cada produto deverá ser atualizada automaticamente conforme as movimentações registradas. O sistema não deverá permitir que uma operação de saída resulte em uma quantidade inferior à disponível no estoque.

O sistema deverá permitir o estabelecimento de níveis mínimos e máximos de estoque. Quando a quantidade disponível atingir ou ficar abaixo do nível mínimo definido, o produto deverá ser identificado como estando com estoque baixo, permitindo que o responsável avalie sua reposição.

Quando aplicável, o sistema também deverá permitir o controle de validade dos produtos, possibilitando identificar produtos próximos do vencimento ou já vencidos.

Todas as movimentações deverão possuir histórico, permitindo identificar o produto movimentado, o tipo de operação, a quantidade, a data e hora e o usuário responsável pela ação.

O sistema deverá permitir a realização de ajustes manuais quando houver divergências entre a quantidade registrada e a quantidade existente fisicamente no estabelecimento. Os ajustes deverão possuir uma justificativa e permanecer registrados no histórico.

Como diferencial do sistema, deverá existir o gerenciamento de receitas relacionadas aos produtos cadastrados no estoque. Uma receita será composta por um conjunto de produtos e pelas respectivas quantidades necessárias para produzir uma unidade da receita.

O cadastro de uma receita não deverá alterar o estoque. A receita funcionará como uma estrutura de consumo que permitirá ao sistema identificar quais produtos são necessários para sua produção.

Com base na quantidade disponível dos produtos utilizados em uma receita, o sistema deverá calcular automaticamente quantas unidades daquela receita podem ser produzidas.

A capacidade de produção deverá ser determinada pelo produto que apresentar a menor quantidade disponível em relação à quantidade necessária para produzir uma unidade da receita, sendo esse produto considerado o fator limitante da produção.

O sistema deverá permitir que o usuário consulte a capacidade atual de produção de uma receita e identifique, quando aplicável, quais produtos estão limitando essa capacidade.

Quando o usuário registrar a produção de uma receita, deverá informar a quantidade produzida. O sistema deverá utilizar a composição cadastrada na receita para calcular automaticamente as quantidades dos produtos que deverão ser retiradas do estoque.

A produção deverá gerar as respectivas movimentações de saída para os produtos utilizados na receita, mantendo o histórico das operações e identificando o usuário responsável pela produção.

O sistema não deverá permitir que o usuário registre uma produção superior à capacidade calculada com base no estoque disponível.

Após uma produção, o estoque dos produtos utilizados deverá ser atualizado e a capacidade de produção das receitas relacionadas deverá ser recalculada.

O sistema deverá permitir o registro de perdas e descartes, possibilitando identificar produtos que deixaram de estar disponíveis devido a vencimento, deterioração, armazenamento inadequado, acidentes ou outros motivos.

As informações armazenadas pelo sistema deverão fornecer suporte ao estabelecimento para acompanhamento do estoque, planejamento de reposições, controle de perdas e análise da capacidade de produção.

Dessa forma, o sistema terá como principal diferencial a integração entre estoque, receitas e produção, permitindo não apenas informar a quantidade disponível de produtos, mas também determinar o que o estabelecimento consegue produzir com os recursos existentes.

## Perfis de Usuários

<table>
<tbody>
<tr align=center>
<th colspan="2">Administrador</th>
</tr>
<tr>
<td width="150px"><b>Descrição</b></td>
<td width="600px">Usuário criado logo após o cadastro da empresa, responsável pela configuração inicial da organização. Cadastra os demais usuários e atribui a eles diferentes perfis e níveis de acesso, de acordo com as responsabilidades de cada pessoa dentro do estabelecimento.</td>
</tr>
<tr>
<td><b>Necessidades</b></td>
<td>Configurar a empresa recém-cadastrada, cadastrar novos usuários e definir os perfis/níveis de acesso de cada um.</td>
</tr>
</tbody>
</table>

<table>
<tbody>
<tr align=center>
<th colspan="2">Usuário (Proprietário, Gerente ou Funcionário)</th>
</tr>
<tr>
<td width="150px"><b>Descrição</b></td>
<td width="600px">Proprietários, gerentes e funcionários responsáveis pelo controle, armazenamento, reposição, produção e utilização dos produtos do estabelecimento. Acessam o sistema com credenciais individuais e possuem acesso aos recursos de acordo com as permissões associadas ao perfil que lhes foi atribuído pelo administrador.</td>
</tr>
<tr>
<td><b>Necessidades</b></td>
<td>Operar as funcionalidades de estoque, receitas e produção conforme as permissões do seu nível de acesso.</td>
</tr>
</tbody>
</table>


## Histórias de Usuários

[Apresente aqui as histórias de usuários que são relevantes para o projeto da solução.]

> **Link Útil**:
> - [Como escrever boas histórias de usuário](https://medium.com/vertice/como-escrever-boas-users-stories-hist%C3%B3rias-de-usu%C3%A1rios-b29c75043fac)

[Utilize o modelo de tabela abaixo para apresentar as histórias de usuários.]

|EU COMO... `QUEM`   | QUERO/PRECISO ... `O QUE` |PARA ... `PORQUE`                 |
|--------------------|---------------------------|----------------------------------|
| ...                | ...                       | ...                              |
| ...                | ...                       | ...                              |

## Requisitos do Projeto

[Com base nas Histórias de Usuários, enumere os requisitos da solução. Lembre-se que cada requisito deve corresponder a uma, e somente uma, característica alvo da solução. Além disso, certifique-se de que todos os aspectos capturados nas Histórias de Usuário foram cobertos.]

### Requisitos Funcionais

|ID    | Descrição                | Prioridade |
|-------|---------------------------------|----|
| RF-01 | O sistema deverá permitir o cadastro de empresas. | A definir |
| RF-02 | O sistema deverá permitir a criação de um usuário administrador para a empresa cadastrada. | A definir |
| RF-03 | O sistema deverá permitir a autenticação dos usuários por meio de credenciais individuais. | A definir |
| RF-04 | O sistema deverá permitir o cadastro, alteração, consulta, ativação e desativação de usuários. | A definir |
| RF-05 | O sistema deverá permitir definir perfis e níveis de acesso para os usuários. | A definir |
| RF-06 | O sistema deverá controlar o acesso aos recursos do sistema de acordo com as permissões do usuário. | A definir |
| RF-07 | O sistema deverá permitir o cadastro de produtos e insumos. | A definir |
| RF-08 | O sistema deverá permitir a alteração e consulta dos produtos cadastrados. | A definir |
| RF-09 | O sistema deverá permitir definir a unidade de medida de cada produto. | A definir |
| RF-10 | O sistema deverá permitir definir os níveis mínimo e máximo de estoque. | A definir |
| RF-11 | O sistema deverá permitir registrar entradas de produtos no estoque. | A definir |
| RF-12 | O sistema deverá permitir registrar saídas de produtos do estoque. | A definir |
| RF-13 | O sistema deverá atualizar automaticamente a quantidade disponível após uma movimentação. | A definir |
| RF-14 | O sistema deverá impedir saídas superiores à quantidade disponível em estoque. | A definir |
| RF-15 | O sistema deverá registrar o histórico das movimentações realizadas. | A definir |
| RF-16 | O sistema deverá permitir realizar ajustes manuais de estoque mediante justificativa. | A definir |
| RF-17 | O sistema deverá identificar produtos com estoque igual ou inferior ao nível mínimo. | A definir |
| RF-18 | O sistema deverá permitir registrar perdas e descartes de produtos. | A definir |
| RF-19 | O sistema deverá permitir consultar a situação atual do estoque. | A definir |
| RF-20 | O sistema deverá permitir cadastrar receitas utilizando produtos cadastrados no estoque. | A definir |
| RF-21 | O sistema deverá permitir definir a quantidade de cada produto utilizada em uma receita. | A definir |
| RF-22 | O sistema deverá calcular a quantidade máxima de unidades que podem ser produzidas de uma receita com base no estoque disponível. | A definir |
| RF-23 | O sistema deverá identificar o produto que limita a capacidade de produção de uma receita. | A definir |
| RF-24 | O sistema deverá permitir registrar a produção de uma receita. | A definir |
| RF-25 | O sistema deverá calcular automaticamente as quantidades de produtos utilizadas durante a produção. | A definir |
| RF-26 | O sistema deverá realizar automaticamente as saídas dos produtos utilizados na produção. | A definir |
| RF-27 | O sistema deverá impedir a produção de quantidade superior à capacidade disponível. | A definir |
| RF-28 | O sistema deverá atualizar o estoque após o registro de uma produção. | A definir |
| RF-29 | O sistema deverá recalcular a capacidade de produção após alterações no estoque. | A definir |
| RF-30 | O sistema deverá permitir consultar produtos próximos do vencimento ou vencidos, quando houver controle de validade. | A definir |
| RF-31 | O sistema deverá registrar o usuário responsável pelas operações realizadas. | A definir |
| RF-32 | O sistema deverá permitir consultar informações e movimentações históricas do estoque. | A definir |
| RF-33 | O sistema deverá fornecer informações que auxiliem na identificação da necessidade de reposição de produtos. | A definir |

**Prioridade: Alta / Média / Baixa.

### Premissas

|ID    | Descrição |
|-------|-----------|
| PE-01 | O estabelecimento deverá possuir as informações necessárias para realizar o cadastro da empresa e dos usuários responsáveis pelo sistema. |
| PE-02 | Cada usuário deverá possuir credenciais individuais para acessar o sistema. |
| PE-03 | Os usuários deverão possuir acesso ao sistema de acordo com suas responsabilidades dentro do estabelecimento. |
| PE-04 | O estabelecimento deverá possuir os produtos e insumos previamente identificados para realização do cadastro. |
| PE-05 | As movimentações de estoque deverão ser registradas pelos usuários responsáveis pelas operações. |
| PE-06 | As quantidades informadas nas movimentações deverão corresponder às quantidades efetivamente movimentadas. |
| PE-07 | O estabelecimento deverá definir os níveis mínimos e máximos de estoque de acordo com sua necessidade. |
| PE-08 | Os produtos utilizados nas receitas deverão estar previamente cadastrados no estoque. |
| PE-09 | As quantidades definidas nas receitas deverão representar o consumo necessário para produzir uma unidade da receita. |
| PE-10 | O usuário deverá possuir permissão adequada para registrar uma produção ou movimentação de estoque. |

### Restrições

|ID    | Descrição | Prioridade |
|-------|-----------|------------|
| RE-01 | O sistema não deverá permitir que usuários acessem dados pertencentes a empresas diferentes daquela à qual estão vinculados. | Alta |
| RE-02 | O sistema não deverá permitir o acesso de usuários desativados. | Alta |
| RE-03 | Somente usuários autorizados poderão realizar alterações administrativas no sistema. | Alta |
| RE-04 | O sistema não deverá permitir movimentações de saída superiores à quantidade disponível em estoque. | Alta |
| RE-05 | Toda movimentação de estoque deverá possuir registro no histórico do sistema. | Alta |
| RE-06 | Ajustes manuais de estoque deverão possuir uma justificativa registrada. | Alta |
| RE-07 | O sistema deverá respeitar as unidades de medida definidas para cada produto durante as movimentações. | Alta |
| RE-08 | O sistema não deverá permitir a produção de quantidade superior à capacidade calculada com base no estoque disponível. | Alta |
| RE-09 | Os produtos utilizados em uma receita deverão estar cadastrados no sistema antes da criação da receita. | Média |
| RE-10 | Uma receita cadastrada não deverá alterar o estoque até que uma produção seja efetivamente registrada. | Alta |

### Requisitos não Funcionais

[Utilize o modelo de tabela abaixo para apresentar os requisitos não-funcionais]

|ID      | Descrição               |Prioridade |
|--------|-------------------------|----|
| RNF-01 |  ...                    | ...   | 
| ...    |  ...                    | ...   | 

**Prioridade: Alta / Média / Baixa. 

## Modelo de Dados

Os modelos do banco de dados (conceitual, lógico e EER) e as decisões sobre estoque, receitas, produção, fotos e permissões estão na página [Arquitetura da Solução](08-Arquitetura%20da%20Solução.md).
