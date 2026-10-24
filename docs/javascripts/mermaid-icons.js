// Enregistre un pack d'icônes réseau (PC, switch, routeur, pare-feu, serveur,
// cloud) pour les diagrammes Mermaid `flowchart` à icônes (@{ icon: ... }),
// auto-hébergé — voir docs/assets/icons-mdi.json, sous-ensemble du pack MDI
// (github.com/Templarian/MaterialDesign, licence Apache 2.0). Zéro
// dépendance réseau externe au moment de la consultation.
(function () {
  // document.currentScript n'est valide que pendant l'exécution synchrone
  // de ce script : on fige l'URL tout de suite, le loader (appelé plus
  // tard, de façon asynchrone) la réutilise telle quelle.
  var scriptSrc = (document.currentScript && document.currentScript.src) || "";
  var iconsUrl = new URL("../assets/icons-mdi.json", scriptSrc).href;

  var registered = false;
  function registerOn(m) {
    if (registered || !m || !m.registerIconPacks) return;
    registered = true;
    m.registerIconPacks([
      {
        name: "mdi",
        loader: () => fetch(iconsUrl).then((r) => r.json()),
      },
    ]);
  }

  // Intercepte l'assignation window.mermaid pour enregistrer le pack au
  // plus tôt possible, quel que soit l'ordre de chargement avec le bundle
  // de Material.
  var _m = window.mermaid;
  if (_m) registerOn(_m);
  Object.defineProperty(window, "mermaid", {
    configurable: true,
    get: function () {
      return _m;
    },
    set: function (v) {
      _m = v;
      registerOn(v);
    },
  });

  // Filet de sécurité : le rendu automatique de Material peut démarrer
  // avant que le pack d'icônes soit enregistré (le chargement du module
  // mermaid et notre interception ci-dessus sont tous les deux
  // asynchrones). Le diagramme reste alors vide — sa source est déjà
  // effacée, impossible à redessiner avec mermaid.run(). On capture donc
  // le texte source de chaque bloc tout de suite, pendant que ce script
  // s'exécute (avant que Material n'ait pu y toucher), pour pouvoir le
  // redessiner nous-mêmes avec l'API bas niveau mermaid.render() si le
  // rendu automatique a échoué.
  var sources = new Map();
  document.querySelectorAll(".mermaid").forEach(function (el) {
    var text = el.textContent.trim();
    if (text) sources.set(el, text);
  });

  var recovered = false;
  function recover() {
    if (recovered || !registered || !window.mermaid) return;
    recovered = true;
    sources.forEach(function (src, el) {
      if (el.childElementCount > 0) return; // déjà rendu correctement
      var id = "mermaid-recover-" + Math.random().toString(36).slice(2);
      window.mermaid
        .render(id, src)
        .then(function (res) {
          el.innerHTML = res.svg;
          if (res.bindFunctions) res.bindFunctions(el);
        })
        .catch(function () {
          /* source invalide : rien à faire de plus ici */
        });
    });
  }

  window.addEventListener("load", function () {
    setTimeout(recover, 300);
  });
})();
