// Enregistre un pack d'icônes réseau (PC, switch, routeur, pare-feu, serveur,
// cloud) pour les diagrammes Mermaid `architecture-beta`, auto-hébergé —
// voir docs/assets/icons-mdi.json, sous-ensemble du pack MDI
// (github.com/Templarian/MaterialDesign, licence Apache 2.0). Zéro
// dépendance réseau externe au moment de la consultation.
//
// Intercepte l'assignation window.mermaid pour enregistrer le pack au bon
// moment, quel que soit l'ordre de chargement avec le bundle de Material.
(function () {
  // document.currentScript n'est valide que pendant l'exécution synchrone
  // de ce script : on fige l'URL tout de suite, le loader (appelé plus
  // tard, de façon asynchrone) la réutilise telle quelle.
  var scriptSrc = (document.currentScript && document.currentScript.src) || "";
  var iconsUrl = new URL("../assets/icons-mdi.json", scriptSrc).href;

  function registerOn(m) {
    if (m && m.registerIconPacks && !m.__iconsRegistered) {
      m.__iconsRegistered = true;
      m.registerIconPacks([
        {
          name: "mdi",
          loader: () => fetch(iconsUrl).then((r) => r.json()),
        },
      ]);
    }
  }

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
})();
