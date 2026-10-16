import { Link } from 'react-router-dom';
import { useIdioma } from '@/i18n/Traducao';
import { href } from '@/i18n/caminhos';
import { useAssinaturaSite } from '@/lib/consultas';
import { Lista, Mail, Nota, PaginaLegal, Secao, Sub } from './Legal';

const reais = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

/** Termos de uso. Os preços do Plano Viajantes vêm da tabela `assinatura` pela API,
 * para o texto nunca ficar atrás do que a loja e o site cobram. */
export default function Termos() {
  const idioma = useIdioma();
  const { data } = useAssinaturaSite();
  const mensal = data?.planos.find((p) => p.periodicidade === 'mensal');
  const anual = data?.planos.find((p) => p.periodicidade === 'anual');
  const economia = mensal && anual ? Math.round((1 - anual.valor / (mensal.valor * 12)) * 100) : null;

  return (
    <PaginaLegal rota="/termos" titulo="Termos e condições" descricao="Termos e condições de uso do Viajantes App." atualizadoEm="15/10/2026">
      <Secao titulo="Termo de aceitação e uso do aplicativo Viajantes APP">
        <p>Ao utilizar o aplicativo Viajantes APP e suas funcionalidades, incluindo a criação de atrativos turísticos e a publicação de imagens, o usuário concorda com os seguintes termos e condições:</p>
      </Secao>

      <Secao titulo="1. Publicação de conteúdo e responsabilidade">
        <p><strong>1.1</strong> O usuário declara ser o único e exclusivo titular dos direitos autorais e de uso das imagens, descrições e informações que publica no aplicativo.</p>
        <p><strong>1.2</strong> Caso o usuário utilize imagens ou conteúdos de terceiros sem a devida autorização, ele será integralmente responsável por quaisquer reivindicações, disputas judiciais ou extrajudiciais e/ou prejuízos decorrentes dessa utilização, isentando o Viajantes APP de qualquer responsabilidade.</p>
        <p><strong>1.3</strong> O usuário concorda que, em caso de violação de direitos autorais ou de uso de imagens de terceiros, será o único responsável por responder legalmente, assumindo todas as despesas e obrigações judiciais e indenizatórias que possam surgir.</p>
      </Secao>

      <Secao titulo="2. Autorização para uso de conteúdo">
        <p><strong>2.1</strong> Ao publicar imagens, textos ou qualquer outro conteúdo no aplicativo, o usuário concede ao Viajantes APP uma licença irrevogável, gratuita, não exclusiva e por tempo indeterminado para usar, reproduzir, adaptar, modificar, distribuir e exibir esse conteúdo dentro do aplicativo ou em materiais promocionais relacionados.</p>
        <p><strong>2.2</strong> Essa autorização inclui o uso das imagens e informações para criar, divulgar e promover atrativos turísticos no aplicativo, garantindo que outros usuários possam acessar e utilizar essas informações para explorar os atrativos descritos.</p>
        <p><strong>2.3</strong> O usuário reconhece que, ao publicar conteúdos no aplicativo, está doando as imagens e informações à base de dados do Viajantes APP, sem qualquer direito de exigir compensações financeiras ou de outro tipo no futuro.</p>
      </Secao>

      <Secao titulo="3. Proibição de uso indevido de conteúdos">
        <p><strong>3.1</strong> O usuário se compromete a não publicar imagens, textos ou informações de terceiros sem autorização prévia e formal.</p>
        <p><strong>3.2</strong> Qualquer tentativa de uso indevido de conteúdos por parte do usuário poderá resultar na exclusão de sua conta e, se necessário, na adoção de medidas legais cabíveis.</p>
      </Secao>

      <Secao titulo="4. Conformidade com a LGPD">
        <p><strong>4.1</strong> O Viajantes APP se compromete a tratar os dados pessoais fornecidos pelos usuários em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).</p>
        <p><strong>4.2</strong> Os dados pessoais fornecidos pelo usuário, como nome, e-mail e informações de perfil, serão utilizados exclusivamente para o funcionamento do aplicativo, incluindo a personalização da experiência e a comunicação entre usuários.</p>
        <p><strong>4.3</strong> Os dados coletados não serão compartilhados com terceiros sem autorização prévia do usuário, salvo quando necessário para cumprir obrigações legais.</p>
        <p><strong>4.4</strong> O usuário tem o direito de acessar, corrigir ou excluir seus dados pessoais a qualquer momento, conforme previsto na LGPD. Para isso, poderá entrar em contato com a administração do aplicativo pelo e-mail de suporte: <Mail />.</p>
        <p><strong>4.5</strong> O Viajantes APP utiliza medidas de segurança para proteger os dados pessoais dos usuários contra acessos não autorizados, perdas ou alterações indevidas.</p>
      </Secao>

      <Secao titulo="5. Isenção de responsabilidade do aplicativo">
        <p><strong>5.1</strong> O Viajantes APP atua apenas como um facilitador, permitindo que usuários compartilhem informações e imagens. O aplicativo não se responsabiliza por conteúdos publicados pelos usuários e possíveis infrações a direitos de terceiros.</p>
        <p><strong>5.2</strong> O Viajantes APP se reserva o direito de excluir ou moderar qualquer conteúdo que viole estes Termos de Aceitação ou que seja considerado inadequado, a exclusivo critério da administração do aplicativo.</p>
      </Secao>

      <Secao titulo="6. Aceitação dos termos">
        <p>Ao utilizar o aplicativo Viajantes APP, o usuário declara ter lido, compreendido e concordado com todos os termos acima, incluindo a política de conformidade com a LGPD, assumindo integralmente a responsabilidade por suas publicações e pelo uso da plataforma.</p>
      </Secao>

      <Secao titulo="7. Assinaturas com renovação automática">
        <Sub titulo="7.1 Planos disponíveis">
          <p>O Viajantes APP oferece acesso a roteiros exclusivos por meio do Plano Viajantes, uma assinatura com renovação automática, vendida no aplicativo (App Store e Google Play) e no site:</p>
          <Lista
            itens={[
              <><strong>Plano Mensal:</strong> {mensal ? `${reais(mensal.valor)} por mês` : 'valor informado na tela de assinatura'}</>,
              <><strong>Plano Anual:</strong> {anual ? `${reais(anual.valor)} por ano${economia && economia > 0 ? ` (economia de ${economia}%)` : ''}` : 'valor informado na tela de assinatura'}</>,
            ]}
          />
          <p>Os valores acima são os vigentes para novas assinaturas. Quem já assina mantém o valor contratado até cancelar ou trocar de plano.</p>
        </Sub>

        <Sub titulo="7.2 O que está incluído">
          <Lista itens={[
            'Acesso completo a todos os roteiros exclusivos da plataforma',
            'Roteiros testados e vividos pela equipe do Viajantes APP',
            'Planejamento dia a dia com horários e atividades detalhadas',
            'Sistema de acompanhamento de progresso das atividades',
            'Links integrados para estabelecimentos e mapas',
            'Novos roteiros adicionados regularmente',
            'Acesso à comunidade exclusiva no WhatsApp com dicas de viagem',
          ]} />
        </Sub>

        <Sub titulo="7.3 Renovação automática e cobrança">
          <p>Sua assinatura será renovada automaticamente no final de cada período (mensal ou anual), a menos que você cancele antes do término do período atual.</p>
          <p>No aplicativo, o pagamento é cobrado na sua conta da Apple App Store (iOS) ou Google Play Store (Android) nas 24 horas anteriores ao fim do período atual. No site, a cobrança é feita no cartão de crédito cadastrado, na data da renovação, pela Pagar.me.</p>
          <p>A renovação automática pode ser desativada a qualquer momento: nas configurações da sua conta na App Store ou no Google Play, ou em <strong>Minha conta → Roteiros</strong> no site, quando a assinatura foi feita por aqui. O acesso continua até o fim do período já pago.</p>
        </Sub>

        <Sub titulo="7.4 Como cancelar sua assinatura">
          <p><strong>iPhone e iPad (iOS):</strong></p>
          <Lista ordenada itens={[
            'Abra o aplicativo "Ajustes" no seu dispositivo',
            'Toque no seu nome no topo da tela',
            'Toque em "Assinaturas"',
            'Selecione a assinatura "Viajantes APP"',
            'Toque em "Cancelar Assinatura" e confirme',
          ]} />
          <p><strong>Android:</strong></p>
          <Lista ordenada itens={[
            'Abra o aplicativo "Google Play Store"',
            'Toque no ícone do perfil, no canto superior direito',
            'Toque em "Pagamentos e assinaturas" e depois em "Assinaturas"',
            'Selecione a assinatura "Viajantes APP"',
            'Toque em "Cancelar assinatura" e siga as instruções',
          ]} />
          <p><strong>Assinatura feita no site:</strong> entre na sua conta, abra <Link className="font-semibold text-brand hover:underline" to={href('/conta/roteiros', idioma)}>Minha conta → Roteiros</Link> e toque em "Cancelar renovação".</p>
          <Nota>
            <strong>Importante:</strong> você pode cancelar a qualquer momento. Ao cancelar, mantém o acesso aos roteiros até o final do período já pago. Não há taxa de cancelamento.
          </Nota>
        </Sub>

        <Sub titulo="7.5 Período de teste gratuito (quando aplicável)">
          <p>Quando oferecido, o período de teste gratuito permite experimentar os recursos premium sem custo. Se você não cancelar antes do fim do período de teste, sua assinatura será automaticamente convertida em assinatura paga.</p>
          <p>Você pode cancelar o teste gratuito a qualquer momento pelas configurações de assinatura na App Store ou no Google Play, sem nenhuma cobrança.</p>
        </Sub>

        <Sub titulo="7.6 Política de reembolso">
          <p>No aplicativo, os pagamentos são processados e gerenciados pela Apple App Store ou pela Google Play Store, conforme a plataforma do seu dispositivo.</p>
          <Lista itens={[
            <><strong>Usuários iOS:</strong> acesse <a className="font-semibold text-brand hover:underline" href="https://reportaproblem.apple.com" target="_blank" rel="noopener">reportaproblem.apple.com</a>, faça login com seu Apple ID, selecione a compra do Viajantes APP e solicite o reembolso.</>,
            <><strong>Usuários Android:</strong> acesse suas compras na Google Play Store, selecione a assinatura do Viajantes APP e siga as instruções para solicitar reembolso.</>,
            <><strong>Assinatura feita no site:</strong> escreva para <Mail /> em até 7 dias após a cobrança, conforme o Código de Defesa do Consumidor.</>,
          ]} />
          <p>Os reembolsos nas lojas estão sujeitos às políticas da Apple e do Google e são concedidos apenas nos casos previstos por elas. O Viajantes APP não tem controle direto sobre esse processo.</p>
        </Sub>

        <Sub titulo="7.7 Gerenciamento da assinatura">
          <p>Você pode gerenciar sua assinatura e ver a data da próxima renovação a qualquer momento nas configurações de assinatura da App Store (iOS) ou do Google Play (Android), ou em Minha conta → Roteiros no site.</p>
          <p>Desativar a renovação automática não encerra a assinatura na hora: ela segue válida até o fim do período pago e não é renovada depois.</p>
        </Sub>

        <Sub titulo="7.8 Alterações de preço">
          <p>Reservamo-nos o direito de alterar os preços das assinaturas a qualquer momento. Alterações de preço valem apenas para novas assinaturas ou, quando aplicadas a assinantes atuais, só a partir do próximo período de renovação, nunca durante um período já pago.</p>
          <p>Você será avisado com antecedência sobre qualquer alteração que afete a sua assinatura, pelo aplicativo, pela loja ou por e-mail. Se não concordar com o novo preço, poderá cancelar antes da próxima renovação.</p>
        </Sub>

        <Sub titulo="7.9 Privacidade e dados de pagamento">
          <p>O Viajantes APP não armazena nem tem acesso aos seus dados de pagamento (número do cartão, senha bancária etc.). Todas as transações são processadas de forma segura pela Apple, pelo Google ou pela Pagar.me, conforme onde a assinatura foi feita.</p>
          <p>Para saber como seus dados pessoais são tratados, consulte nossa <Link className="font-semibold text-brand hover:underline" to={href('/privacidade', idioma)}>Política de Privacidade</Link>.</p>
        </Sub>
      </Secao>

      <Secao titulo="8. Contato e suporte">
        <p>Para dúvidas sobre assinaturas, cancelamentos, reembolsos ou qualquer outro assunto relacionado ao aplicativo, entre em contato:</p>
        <Lista itens={[
          <><strong>E-mail de suporte:</strong> <Mail /></>,
          <><strong>Website:</strong> <a className="font-semibold text-brand hover:underline" href="https://viajantesapp.com.br">viajantesapp.com.br</a></>,
          <><strong>Desenvolvedor:</strong> Front Haus</>,
        ]} />
        <p>Nossa equipe de suporte responde às solicitações em até 48 horas úteis.</p>
      </Secao>
    </PaginaLegal>
  );
}
