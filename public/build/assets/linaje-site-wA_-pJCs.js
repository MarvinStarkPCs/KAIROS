import{r as s,j as e,H as m,e as p,L as l}from"./app-DMh_hbef.js";import{l as h}from"./index-DGqjgjXJ.js";import{i as f}from"./index-D12nj1Ca.js";const c="https://wa.me/573004218146",b=r=>{const a=r.split(",").map(i=>i.trim().toLowerCase()).filter(Boolean),n=a.length>1?`${a.slice(0,-1).join(", ")} y ${a[a.length-1]}`:a[0]??"";return n.charAt(0).toUpperCase()+n.slice(1)},t=r=>{const[a,n]=r.trim().split(":").map(Number);if(Number.isNaN(a))return r;const i=a<12?"a. m.":"p. m.";return`${a%12||12}:${String(n??0).padStart(2,"0")} ${i}`},v=r=>{const[a,n]=r.split("-").map(d=>d.trim());if(!n)return t(a);const i=t(a),o=t(n);return i.slice(-5)===o.slice(-5)?`${i.slice(0,-6)} – ${o}`:`${i} – ${o}`};function k(){const r=s.useRef(null);return s.useEffect(()=>{const a=r.current;if(!a||!("IntersectionObserver"in window))return;const n=new IntersectionObserver(i=>{i.forEach(o=>{(o.isIntersecting||o.boundingClientRect.top<0)&&(o.target.classList.add("is-in"),n.unobserve(o.target))})},{rootMargin:"0px 0px -12% 0px"});return a.querySelectorAll("[data-reveal]").forEach(i=>n.observe(i)),a.classList.add("reveal-ready"),()=>n.disconnect()},[]),r}function w(){return e.jsxs(m,{children:[e.jsx("link",{rel:"preconnect",href:"https://fonts.bunny.net"}),e.jsx("link",{href:"https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700&display=swap",rel:"stylesheet"})]})}function y({onHome:r=!1}){const{auth:a}=p().props,n=r?"":"/";return e.jsxs(e.Fragment,{children:[e.jsx("a",{href:"#contenido",className:"skip-link",children:"Saltar al contenido"}),e.jsx("header",{role:"banner",className:"sticky top-0 z-50 bg-[var(--ground)]",children:e.jsxs("nav",{"aria-label":"Navegación principal",className:"mx-auto flex h-18 max-w-7xl items-center justify-between gap-6 px-5 sm:px-8",children:[e.jsxs("a",{href:"/",className:"flex shrink-0 items-center","aria-label":"Academia Linaje - Inicio",children:[e.jsx("img",{src:"/logo_academia_black.png",alt:"Academia Linaje - Escuela de Música en Ocaña",className:"h-11 w-auto dark:hidden",width:"150",height:"48",fetchPriority:"high",decoding:"async"}),e.jsx("img",{src:"/logo_academia_white.png",alt:"Academia Linaje - Escuela de Música en Ocaña",className:"hidden h-11 w-auto dark:block",width:"150",height:"48",fetchPriority:"high",decoding:"async"})]}),e.jsxs("div",{className:"flex items-center gap-7 text-base font-medium",children:[e.jsx("a",{href:`${n}#programas`,className:"nav-link hidden md:block",children:"Programas"}),e.jsx("a",{href:`${n}#preguntas`,className:"nav-link hidden md:block",children:"Preguntas"}),e.jsx("a",{href:`${n}#contacto`,className:"nav-link hidden md:block",children:"Contacto"}),a.user?e.jsx(l,{href:f().url,className:"btn btn-gold",children:"Mi Portal"}):e.jsxs(e.Fragment,{children:[e.jsx(l,{href:h(),className:"nav-link hidden sm:block",children:"Acceso"}),e.jsx("a",{href:`${n}#formulario-clase-gratis`,className:"btn btn-gold",children:"Clase gratis"})]})]})]})})]})}function N({programs:r}){return e.jsx("footer",{role:"contentinfo",className:"bg-[var(--night)] pt-24 pb-28 text-[var(--on-night)] sm:pt-32 sm:pb-12",children:e.jsxs("div",{className:"mx-auto max-w-7xl px-5 sm:px-8",children:[e.jsx("img",{src:"/logo_academia_white.png",alt:"Academia Linaje - Escuela de Música en Ocaña",className:"h-auto w-[min(100%,34rem)]",width:"175",height:"56",loading:"lazy",decoding:"async"}),e.jsx("p",{className:"mt-8 max-w-xl text-lg leading-relaxed text-[var(--on-night-2)]",children:"Formando músicos con excelencia y pasión desde hace más de 10 años."}),e.jsxs("div",{className:"mt-14 grid gap-10 text-base sm:grid-cols-2 lg:grid-cols-3",children:[e.jsxs("div",{className:"flex flex-col gap-2 text-[var(--on-night-2)]",children:[e.jsx("a",{href:c,target:"_blank",rel:"noopener noreferrer",className:"footer-link",children:"WhatsApp 300 421 8146"}),e.jsx("a",{href:"mailto:Linajeacademia@gmail.com",className:"footer-link",children:"Linajeacademia@gmail.com"}),e.jsx("span",{children:"Calle 11 #25A - 15, Las Llanadas, Ocaña"})]}),r.length>0&&e.jsx("nav",{"aria-label":"Clases de música en Ocaña",className:"lg:col-span-2",children:e.jsxs("ul",{className:"grid grid-cols-2 gap-x-8 gap-y-2 text-[var(--on-night-2)] sm:grid-cols-3",children:[r.map(a=>e.jsx("li",{children:e.jsxs("a",{href:`/clases/${a.slug}`,className:"footer-link",children:["Clases de ",a.label]})},a.slug)),e.jsx("li",{children:e.jsx("a",{href:"/matricula",className:"footer-link",children:"Matrícula"})})]})})]}),e.jsxs("p",{className:"mt-16 text-sm text-[var(--on-night-3)]",children:["© ",new Date().getFullYear()," Academia Linaje. Todos los derechos reservados."]})]})})}function z(){return e.jsx("a",{href:c,target:"_blank",rel:"noopener noreferrer",className:"whatsapp fixed z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white","aria-label":"Contactar por WhatsApp",children:e.jsx("svg",{viewBox:"0 0 24 24",className:"h-7 w-7 fill-current","aria-hidden":!0,children:e.jsx("path",{d:"M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"})})})}function L(){return e.jsx("style",{children:g})}const g=`
    .linaje {
        --ground: #f6f2ea;
        --paper: #ece6da;
        --ink: #17140f;
        --ink-2: #57504a;
        --line: #cfc6b6;
        --gold: #e9a91c;
        --gold-press: #d69812;
        --night: #110f0c;
        --on-night: #f6f2ea;
        --on-night-2: #c9c0b2;
        --on-night-3: #8f877b;
        --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
        font-family: 'Instrument Sans', ui-sans-serif, system-ui, sans-serif;
        -webkit-font-smoothing: antialiased;
        -webkit-tap-highlight-color: transparent;
        caret-color: var(--gold);
    }
    .dark .linaje {
        --ground: #15130f;
        --paper: #1e1b16;
        --ink: #f3eee4;
        --ink-2: #b8afa2;
        --line: #3a352d;
        --night: #0b0a08;
    }
    .linaje ::selection { background: var(--gold); color: #17140f; }
    .linaje :focus-visible { outline: 2px solid var(--gold); outline-offset: 3px; }
    .linaje p, .linaje li, .linaje dd, .linaje blockquote { text-wrap: pretty; }

    .linaje .skip-link {
        position: fixed; left: 1rem; top: 1rem; z-index: 60;
        border-radius: 999px; background: var(--ink); color: var(--ground);
        padding: 0.7rem 1.25rem; font-size: 16px; font-weight: 600;
    }
    /* Oculto hasta recibir el foco del teclado */
    .linaje .skip-link:not(:focus) {
        width: 1px; height: 1px; padding: 0; overflow: hidden;
        clip-path: inset(50%); white-space: nowrap;
    }

    .linaje .t-display {
        font-size: clamp(2.4rem, 7.5vw, 6rem);
        line-height: 0.95;
        font-weight: 600;
        letter-spacing: -0.035em;
        text-wrap: balance;
    }
    .linaje .section-title {
        font-size: clamp(2.4rem, 5vw, 4.25rem);
        line-height: 1;
        font-weight: 600;
        letter-spacing: -0.035em;
        text-wrap: balance;
    }
    .linaje .t-h3 {
        font-size: clamp(1.75rem, 2.6vw, 2.25rem);
        line-height: 1.1;
        font-weight: 600;
        letter-spacing: -0.025em;
        text-wrap: balance;
        overflow-wrap: anywhere;
    }

    /* Botones: relleno plano, píldora, respuesta inmediata al presionar */
    .linaje .btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        border-radius: 999px;
        padding: 0.7rem 1.35rem;
        font-size: 16px;
        font-weight: 600;
        white-space: nowrap;
        touch-action: manipulation;
        transition: transform 160ms var(--ease-out), background-color 150ms ease;
    }
    .linaje .btn:active:not(:disabled) { transform: scale(0.97); }
    .linaje .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .linaje .btn-lg { padding: 1rem 1.75rem; font-size: 18px; }
    .linaje .btn-gold { background: var(--gold); color: #17140f; }
    .linaje .btn-ink { background: var(--ink); color: var(--ground); }
    .linaje .btn-arrow { transition: transform 200ms var(--ease-out); }

    .linaje .nav-link, .linaje .footer-link { transition: color 150ms ease; }
    .linaje .text-link { text-decoration: underline; text-underline-offset: 0.25em; text-decoration-thickness: 1px; }

    /* Listas de programas */
    .linaje .program-row { transition: background-color 200ms ease; }
    .linaje .program-link { display: inline-block; transition: transform 250ms var(--ease-out); }
    .linaje .row-arrow {
        display: flex; height: 2.75rem; width: 2.75rem; align-items: center; justify-content: center;
        border-radius: 999px; background: var(--paper);
        transition: transform 250ms var(--ease-out), background-color 200ms ease;
    }

    /* Formulario */
    .linaje .field-label { display: block; margin-bottom: 0.5rem; font-size: 16px; font-weight: 600; }
    .linaje legend.field-label { margin-bottom: 0; }
    .linaje .field {
        width: 100%;
        border-radius: 0.75rem;
        border: 1px solid var(--line);
        background: var(--ground);
        padding: 0.8rem 1rem;
        font-size: 16px;
        color: var(--ink);
        transition: border-color 150ms ease, box-shadow 150ms ease;
    }
    .linaje .field::placeholder { color: var(--ink-2); opacity: 0.75; }
    .linaje .field:focus { outline: none; border-color: var(--gold); box-shadow: 0 0 0 3px color-mix(in srgb, var(--gold) 30%, transparent); }
    .linaje .field[aria-invalid='true'] { border-color: #b42318; }
    .linaje .field-error { margin-top: 0.4rem; font-size: 14px; color: #b42318; }
    .dark .linaje .field-error { color: #f97066; }

    .linaje .choice {
        position: relative;
        cursor: pointer;
        border-radius: 0.9rem;
        background: var(--paper);
        padding: 0.9rem 1rem;
        overflow-wrap: anywhere;
        touch-action: manipulation;
        transition: background-color 150ms ease, color 150ms ease, transform 160ms var(--ease-out);
    }
    .linaje .choice:active { transform: scale(0.98); }
    .linaje .choice-hint { color: var(--ink-2); }
    .linaje .choice.is-checked { background: var(--ink); color: var(--ground); }
    .linaje .choice.is-checked .choice-hint { color: color-mix(in srgb, var(--ground) 75%, transparent); }
    .linaje .choice:has(input:focus-visible) { outline: 2px solid var(--gold); outline-offset: 3px; }

    /* Al llegar desde "Probar gratis": un anillo dorado señala una vez la clase elegida */
    .linaje .choice::after {
        content: ''; position: absolute; inset: -5px; border-radius: 1.2rem;
        border: 2px solid var(--gold); opacity: 0; pointer-events: none;
    }
    .linaje .choice.is-flash::after { animation: linaje-ring 1100ms var(--ease-out) 350ms both; }

    /* Estado del envío del formulario */
    .linaje .notice { border-radius: 1rem; padding: 1rem 1.25rem; font-size: 16px; line-height: 1.5; }
    .linaje .notice-success { background: color-mix(in srgb, #2f7d32 14%, var(--ground)); }
    .linaje .notice-warning { background: color-mix(in srgb, var(--gold) 22%, var(--ground)); }
    .linaje .notice-error { background: color-mix(in srgb, #b42318 14%, var(--ground)); }

    /* Preguntas frecuentes y campos que aparecen según lo elegido */
    .linaje .faq-chevron { transition: transform 250ms var(--ease-out); }
    .linaje .faq[open] .faq-chevron { transform: rotate(180deg); }
    .linaje .faq[open] .faq-answer, .linaje .appear { animation: linaje-rise-sm 220ms var(--ease-out) both; }

    .linaje .whatsapp {
        right: 1.25rem;
        bottom: calc(1.25rem + env(safe-area-inset-bottom, 0px));
        box-shadow: 0 8px 24px rgb(0 0 0 / 0.22);
        touch-action: manipulation;
        transition: transform 160ms var(--ease-out);
    }
    .linaje .whatsapp:active { transform: scale(0.94); }
    @media (min-width: 640px) {
        .linaje .whatsapp { right: 1.5rem; bottom: calc(1.5rem + env(safe-area-inset-bottom, 0px)); }
    }

    @media (hover: hover) and (pointer: fine) {
        .linaje .btn-gold:hover { background: var(--gold-press); }
        .linaje .btn:hover .btn-arrow { transform: translateX(3px); }
        .linaje .nav-link:hover { color: var(--ink-2); }
        .linaje .footer-link:hover { color: var(--on-night); }
        .linaje .program-row:hover { background: var(--paper); }
        .linaje .program-row.on-paper:hover { background: color-mix(in srgb, var(--ground) 55%, var(--line)); }
        .linaje .program-row:hover .program-link { transform: translateX(6px); }
        .linaje .program-row:hover .row-arrow { background: var(--gold); color: #17140f; transform: translateX(2px); }
        .linaje .choice:not(.is-checked):hover { background: color-mix(in srgb, var(--paper) 70%, var(--line)); }
    }

    /* Entrada de la primera pantalla: el video se asienta y el texto sube en cascada */
    @keyframes linaje-settle { from { transform: scale(1.08); } to { transform: scale(1); } }
    @keyframes linaje-rise { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: none; } }
    @keyframes linaje-rise-sm { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
    @keyframes linaje-fade { from { opacity: 0; } to { opacity: 1; } }
    @keyframes linaje-ring {
        0% { opacity: 0; transform: scale(0.97); }
        30% { opacity: 1; transform: scale(1); }
        100% { opacity: 0; transform: scale(1); }
    }
    .linaje .hero-media { animation: linaje-settle 1600ms var(--ease-out) both; }
    .linaje .hero-line { animation: linaje-rise 900ms var(--ease-out) both; animation-delay: 150ms; }
    .linaje .hero-line-2 { animation-delay: 230ms; }
    .linaje .hero-line-3 { animation-delay: 310ms; }
    .linaje .hero-line-4 { animation-delay: 390ms; }

    /* Revelado al hacer scroll: solo se oculta cuando el script ya está listo */
    .linaje.reveal-ready [data-reveal]:not(.is-in) { opacity: 0; transform: translateY(24px); }
    .linaje [data-reveal] { transition: opacity 600ms var(--ease-out), transform 600ms var(--ease-out); }
    .linaje [data-reveal]:nth-child(2) { transition-delay: 60ms; }
    .linaje [data-reveal]:nth-child(3) { transition-delay: 120ms; }
    .linaje [data-reveal]:nth-child(4) { transition-delay: 180ms; }

    @media (prefers-reduced-motion: reduce) {
        .linaje .hero-media { animation: none; }
        .linaje .hero-line { animation-name: linaje-fade; animation-duration: 400ms; }
        .linaje.reveal-ready [data-reveal]:not(.is-in) { transform: none; }
        .linaje [data-reveal] { transition: opacity 400ms ease; }
        .linaje .faq[open] .faq-answer, .linaje .appear { animation-name: linaje-fade; }
        .linaje .choice.is-flash::after { animation: none; }
        .linaje .program-row:hover .program-link,
        .linaje .program-row:hover .row-arrow,
        .linaje .btn:hover .btn-arrow { transform: none; }
    }
`;export{w as S,c as W,N as a,y as b,L as c,z as d,t as e,b as f,v as g,k as u};
