import { useEffect } from 'react';

/**
 * Medição e anúncios — carregados SÓ depois do aceite (LGPD).
 *
 * São os mesmos do site antigo: Google Tag Manager, Meta Pixel e AdSense. O
 * componente só é montado depois da resposta ao aviso, então nenhum pedido sai
 * para eles antes disso. Os scripts entram uma única vez por visita.
 */
const GTM = 'GTM-W7L6T6X';
const PIXEL = '748226149062634';
const ADSENSE = 'ca-pub-4436664863660214';

function injetar(id: string, codigo: string) {
  if (document.getElementById(id)) return;
  const script = document.createElement('script');
  script.id = id;
  script.async = true;
  script.textContent = codigo;
  document.head.appendChild(script);
}

function injetarExterno(id: string, src: string, atributos: Record<string, string> = {}) {
  if (document.getElementById(id)) return;
  const script = document.createElement('script');
  script.id = id;
  script.async = true;
  script.src = src;
  for (const [chave, valor] of Object.entries(atributos)) script.setAttribute(chave, valor);
  document.head.appendChild(script);
}

export default function Analytics() {
  useEffect(() => {
    injetar(
      'gtm',
      `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
      var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
      j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${GTM}');`,
    );

    injetar(
      'meta-pixel',
      `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
      n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
      (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
      fbq('init','${PIXEL}');fbq('track','PageView');`,
    );

    injetarExterno(
      'adsense',
      `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE}`,
      { crossorigin: 'anonymous' },
    );
  }, []);

  return null;
}
