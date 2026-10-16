import { Link } from 'react-router-dom';
import { useIdioma } from '@/i18n/Traducao';
import { href } from '@/i18n/caminhos';
import { Lista, Mail, Nota, PaginaLegal, Secao, Sub } from './Legal';

export default function Privacidade() {
  const idioma = useIdioma();

  return (
    <PaginaLegal rota="/privacidade" titulo="Política de Privacidade" descricao="Política de privacidade do Viajantes App: quais dados coletamos e como usamos." atualizadoEm="15/10/2026">
      <Secao titulo="1. Introdução">
        <p>A Front Haus, desenvolvedora do aplicativo <strong>Viajantes APP</strong>, está comprometida em proteger sua privacidade e seus dados pessoais.</p>
        <p>Esta Política de Privacidade explica como coletamos, usamos, armazenamos e compartilhamos suas informações pessoais quando você utiliza nosso aplicativo, nosso site e os serviços relacionados.</p>
        <p>Ao utilizar o Viajantes APP, você concorda com as práticas descritas nesta Política de Privacidade. Se não concordar com qualquer parte dela, por favor, não utilize nosso aplicativo.</p>
      </Secao>

      <Secao titulo="2. Informações que coletamos">
        <Sub titulo="2.1 Informações fornecidas diretamente por você">
          <Lista itens={[
            <><strong>Informações de cadastro:</strong> nome completo, endereço de e-mail, foto de perfil, data de nascimento (opcional)</>,
            <><strong>Informações de perfil:</strong> biografia, preferências de viagem, interesses</>,
            <><strong>Conteúdo criado:</strong> avaliações de locais, comentários, fotos que você publica, descrições de atrativos turísticos</>,
            <><strong>Comunicações:</strong> mensagens enviadas ao nosso suporte ou feedback fornecido</>,
            <><strong>Informações de assinatura:</strong> dados relacionados à sua assinatura premium (processados pela Apple, pelo Google ou pela Pagar.me, no site)</>,
          ]} />
        </Sub>
        <Sub titulo="2.2 Informações coletadas automaticamente">
          <Lista itens={[
            <><strong>Localização geográfica:</strong> com sua permissão, coletamos sua localização atual para mostrar atrativos próximos, registrar check-ins em cachoeiras e personalizar recomendações</>,
            <><strong>Informações do dispositivo:</strong> modelo, sistema operacional, versão do app, identificadores únicos do dispositivo, idioma, fuso horário</>,
            <><strong>Dados de uso:</strong> como você interage com o app, recursos acessados, tempo de uso, cliques, buscas realizadas, atrativos visualizados</>,
            <><strong>Dados técnicos:</strong> endereço IP, tipo de conexão, logs de erros, dados de desempenho do aplicativo</>,
          ]} />
        </Sub>
        <Sub titulo="2.3 Informações de terceiros">
          <Lista itens={[
            <><strong>Login social:</strong> se você escolher entrar com Facebook, Apple ou Google, receberemos informações básicas do seu perfil (nome, e-mail, foto) conforme autorizado por você</>,
            <><strong>Informações de pagamento:</strong> dados sobre transações de assinatura processadas pela Apple App Store, pela Google Play Store ou pela Pagar.me (não armazenamos dados de cartão de crédito)</>,
          ]} />
          <Nota>
            <strong>Importante sobre localização:</strong> a coleta de localização só ocorre com sua permissão explícita. Você pode desativar o acesso nas configurações do seu dispositivo a qualquer momento, mas isso pode limitar algumas funcionalidades do app.
          </Nota>
        </Sub>
      </Secao>

      <Secao titulo="3. Como usamos suas informações">
        <Sub titulo="3.1 Fornecer e melhorar nossos serviços">
          <Lista itens={['Operar e manter o aplicativo funcionando corretamente', 'Criar e gerenciar sua conta de usuário', 'Personalizar sua experiência mostrando conteúdo relevante', 'Fornecer roteiros e recomendações baseados em sua localização e preferências', 'Permitir que você crie e compartilhe conteúdo com outros usuários']} />
        </Sub>
        <Sub titulo="3.2 Processar transações">
          <Lista itens={['Gerenciar assinaturas e compras', 'Processar pagamentos pela Apple, pelo Google ou pela Pagar.me', 'Enviar confirmações de compra e renovações', 'Fornecer acesso a recursos premium']} />
        </Sub>
        <Sub titulo="3.3 Comunicação">
          <Lista itens={['Responder suas dúvidas e solicitações de suporte', 'Enviar notificações importantes sobre sua conta ou serviço', 'Informar sobre atualizações do aplicativo', 'Enviar newsletters e conteúdo promocional (com seu consentimento)']} />
        </Sub>
        <Sub titulo="3.4 Segurança e prevenção de fraudes">
          <Lista itens={['Detectar e prevenir atividades fraudulentas ou ilegais', 'Proteger a segurança dos usuários', 'Monitorar e analisar o uso do aplicativo', 'Fazer backup e recuperar dados']} />
        </Sub>
        <Sub titulo="3.5 Análise e melhoria">
          <Lista itens={['Analisar tendências de uso e preferências dos usuários', 'Melhorar funcionalidades existentes e desenvolver novas', 'Realizar pesquisas e análises estatísticas', 'Testar novos recursos e funcionalidades']} />
        </Sub>
        <Sub titulo="3.6 Cumprimento legal">
          <Lista itens={['Cumprir obrigações legais e regulatórias', 'Responder a solicitações de autoridades competentes', 'Fazer valer nossos Termos de Uso']} />
        </Sub>
      </Secao>

      <Secao titulo="4. Compartilhamento de informações">
        <p>Levamos sua privacidade a sério e compartilhamos suas informações apenas nas seguintes situações:</p>
        <Sub titulo="4.1 Com outros usuários (informações públicas)">
          <p>Algumas informações do seu perfil são visíveis para outros usuários do aplicativo:</p>
          <Lista itens={['Nome e foto de perfil', 'Biografia pública', 'Avaliações e comentários que você publica', 'Fotos que você compartilha publicamente', 'Atrativos turísticos que você cria']} />
          <p><strong>Você controla:</strong> você pode escolher o que compartilhar e excluir suas publicações no aplicativo.</p>
        </Sub>
        <Sub titulo="4.2 Com prestadores de serviços">
          <p>Compartilhamos informações com empresas terceirizadas que nos ajudam a operar o aplicativo:</p>
          <Lista itens={[
            <><strong>Hospedagem e armazenamento:</strong> servidores em nuvem para armazenar dados</>,
            <><strong>Processamento de pagamentos:</strong> Apple App Store, Google Play Store e Pagar.me</>,
            <><strong>Análise e monitoramento:</strong> ferramentas para entender como o app é usado</>,
            <><strong>Notificações push:</strong> serviços para enviar notificações</>,
            <><strong>Suporte ao cliente:</strong> ferramentas para atendimento e suporte</>,
          ]} />
          <p>Esses prestadores têm acesso limitado às suas informações e são obrigados contratualmente a proteger seus dados e usá-los apenas para os fins específicos.</p>
        </Sub>
        <Sub titulo="4.3 Por razões legais">
          <p>Podemos divulgar suas informações quando acreditarmos ser necessário para:</p>
          <Lista itens={['Cumprir leis, regulamentos ou processos legais', 'Responder a solicitações governamentais válidas', 'Proteger os direitos, propriedade ou segurança da Front Haus, dos usuários ou do público', 'Detectar, prevenir ou lidar com fraudes ou questões de segurança', 'Fazer valer nossos Termos de Uso']} />
        </Sub>
        <Sub titulo="4.4 Transferência de negócios">
          <p>Em caso de fusão, aquisição, reorganização ou venda de ativos da empresa, suas informações pessoais podem ser transferidas. Notificaremos você antes que suas informações sejam transferidas e fiquem sujeitas a uma política de privacidade diferente.</p>
        </Sub>
        <Sub titulo="4.5 Com seu consentimento">
          <p>Podemos compartilhar suas informações para outros propósitos com seu consentimento explícito.</p>
        </Sub>
      </Secao>

      <Secao titulo="5. Segurança dos dados">
        <p>Implementamos medidas de segurança técnicas, administrativas e físicas apropriadas para proteger suas informações pessoais contra acesso não autorizado, perda, destruição, alteração ou divulgação indevida.</p>
        <Lista itens={[
          <><strong>Criptografia:</strong> dados transmitidos entre seu dispositivo e nossos servidores são criptografados usando HTTPS/TLS</>,
          <><strong>Controles de acesso:</strong> acesso restrito aos dados apenas para funcionários e prestadores que precisam deles para realizar suas funções</>,
          <><strong>Monitoramento:</strong> sistemas de detecção de intrusão e monitoramento contínuo de segurança</>,
          <><strong>Backups regulares:</strong> cópias de segurança para prevenir perda de dados</>,
          <><strong>Atualizações de segurança:</strong> manutenção regular e patches de segurança</>,
        ]} />
        <Nota>
          <strong>Importante:</strong> apesar de todos os nossos esforços, nenhum método de transmissão pela internet ou armazenamento eletrônico é 100% seguro. Não podemos garantir segurança absoluta, mas trabalhamos continuamente para proteger suas informações.
        </Nota>
      </Secao>

      <Secao titulo="6. Seus direitos (LGPD)">
        <p>De acordo com a Lei Geral de Proteção de Dados (LGPD, Lei nº 13.709/2018), você tem os seguintes direitos em relação aos seus dados pessoais:</p>
        <Lista itens={[
          <><strong>Acesso:</strong> confirmar se tratamos seus dados e pedir uma cópia deles</>,
          <><strong>Correção:</strong> corrigir dados incompletos, inexatos ou desatualizados (o perfil pode ser atualizado no próprio app)</>,
          <><strong>Exclusão:</strong> excluir sua conta e os dados associados, ou dados desnecessários ou tratados em desconformidade</>,
          <><strong>Portabilidade:</strong> receber seus dados em formato estruturado e legível por máquina</>,
          <><strong>Oposição:</strong> opor-se ao tratamento e revogar o consentimento</>,
          <><strong>Restrição:</strong> pedir a limitação do uso dos seus dados</>,
        ]} />
        <Sub titulo="6.1 Como exercer seus direitos">
          <p>Escreva para <Mail /> com o assunto "Solicitação LGPD - [tipo de solicitação]". Respondemos em até 15 dias úteis e podemos pedir informações adicionais para confirmar sua identidade antes de atender.</p>
        </Sub>
      </Secao>

      <Secao titulo="7. Retenção de dados">
        <p>Mantemos suas informações pessoais pelo tempo necessário para cumprir os propósitos descritos nesta política, a menos que um período maior seja exigido ou permitido por lei.</p>
        <Lista itens={[
          <><strong>Conta ativa:</strong> enquanto sua conta estiver ativa</>,
          <><strong>Assinaturas:</strong> dados de pagamento mantidos conforme exigências fiscais (geralmente 5 anos)</>,
          <><strong>Conteúdo público:</strong> avaliações e fotos podem ser mantidas mesmo após a exclusão da conta, de forma anonimizada</>,
          <><strong>Dados de suporte:</strong> comunicações mantidas por até 3 anos</>,
          <><strong>Logs de segurança:</strong> mantidos por até 6 meses</>,
        ]} />
        <p>Quando você excluir sua conta, removeremos ou anonimizaremos seus dados pessoais, exceto quando precisarmos mantê-los por obrigações legais, resolução de disputas ou para fazer valer nossos acordos.</p>
      </Secao>

      <Secao titulo="8. Crianças e menores">
        <p>O Viajantes APP não é destinado a crianças menores de 13 anos e não coleta intencionalmente informações pessoais de crianças.</p>
        <p>Se você é pai, mãe ou responsável e acredita que seu filho nos forneceu informações pessoais, entre em contato conosco imediatamente. Ao descobrir dados de uma criança menor de 13 anos sem consentimento parental verificado, tomaremos medidas para excluí-los dos nossos servidores.</p>
      </Secao>

      <Secao titulo="9. Cookies e tecnologias similares">
        <p>Utilizamos cookies, pixels, tags e tecnologias similares para melhorar sua experiência, analisar tendências e administrar o aplicativo e o site. Cookies são pequenos arquivos de texto guardados no seu dispositivo que nos ajudam a reconhecer você, lembrar suas preferências e entender como você usa o serviço.</p>
        <Lista itens={[
          <><strong>Essenciais:</strong> necessários para o funcionamento básico</>,
          <><strong>Preferências:</strong> lembram suas configurações e escolhas</>,
          <><strong>Análise:</strong> nos ajudam a entender como o serviço é usado</>,
          <><strong>Marketing:</strong> usados para personalizar conteúdo (com consentimento)</>,
        ]} />
        <p>Você pode controlar os cookies nas configurações do seu dispositivo ou navegador. Desativá-los pode afetar algumas funcionalidades.</p>
      </Secao>

      <Secao titulo="10. Transferências internacionais">
        <p>Suas informações podem ser transferidas e mantidas em servidores fora do Brasil, em países onde operamos ou onde nossos prestadores de serviços operam. Nesses casos garantimos medidas adequadas de proteção, como cláusulas contratuais padrão, certificações de privacidade e compromissos contratuais de proteção de dados. Ao usar nosso aplicativo, você consente com essas transferências.</p>
      </Secao>

      <Secao titulo="11. Alterações nesta política">
        <p>Podemos atualizar esta Política de Privacidade periodicamente para refletir mudanças em nossas práticas, tecnologia, requisitos legais ou por outras razões operacionais. A data no topo desta página é atualizada a cada mudança; para mudanças significativas, avisamos por e-mail ou no aplicativo.</p>
        <p>O uso continuado do aplicativo após as alterações constitui sua aceitação da política atualizada.</p>
      </Secao>

      <Secao titulo="12. Base legal para o tratamento (LGPD)">
        <Lista itens={[
          <><strong>Consentimento:</strong> quando você nos dá permissão explícita (ex.: localização, marketing)</>,
          <><strong>Execução de contrato:</strong> para fornecer os serviços que você solicitou</>,
          <><strong>Obrigação legal:</strong> para cumprir leis e regulamentos aplicáveis</>,
          <><strong>Interesses legítimos:</strong> para melhorar nossos serviços, prevenir fraudes e garantir segurança</>,
        ]} />
      </Secao>

      <Secao titulo="13. Links para sites de terceiros">
        <p>O aplicativo e o site podem conter links para sites ou serviços de terceiros que não são operados por nós. Não temos controle sobre o conteúdo, as políticas de privacidade ou as práticas desses sites e recomendamos que você revise a política de cada um que visitar.</p>
      </Secao>

      <Secao titulo="14. Contato e encarregado de dados">
        <Lista itens={[
          <><strong>E-mail de suporte e DPO:</strong> <Mail /></>,
          <><strong>Website:</strong> <a className="font-semibold text-brand hover:underline" href="https://viajantesapp.com.br">viajantesapp.com.br</a></>,
          <><strong>Empresa:</strong> Front Haus</>,
        ]} />
        <p>Respondemos às suas solicitações em até 15 dias úteis.</p>
      </Secao>

      <Secao titulo="15. Direito de reclamação">
        <p>Você tem o direito de apresentar uma reclamação à Autoridade Nacional de Proteção de Dados (ANPD) se acreditar que o tratamento dos seus dados pessoais viola a LGPD: <a className="font-semibold text-brand hover:underline" href="https://www.gov.br/anpd/pt-br" target="_blank" rel="noopener">www.gov.br/anpd</a>.</p>
        <p>Veja também os nossos <Link className="font-semibold text-brand hover:underline" to={href('/termos', idioma)}>Termos e condições</Link>.</p>
      </Secao>
    </PaginaLegal>
  );
}
