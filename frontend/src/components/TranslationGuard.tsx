import Script from "next/script";

// Browser translation (e.g. Chrome's "Translate this page") swaps text nodes for <font> elements
// behind React's back. The next React update then calls removeChild/insertBefore on a node that
// moved and the whole page crashes ("Application error"). Tolerating those two calls keeps the
// page usable while translated (workaround from facebook/react#11538).
const guard = `
(function () {
  if (typeof Node !== "function" || !Node.prototype) return;
  var removeChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function (child) {
    if (child.parentNode !== this) {
      console.warn("Skipped removeChild of a node moved by browser translation", child);
      return child;
    }
    return removeChild.apply(this, arguments);
  };
  var insertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function (newNode, referenceNode) {
    if (referenceNode && referenceNode.parentNode !== this) {
      console.warn("Skipped insertBefore next to a node moved by browser translation", referenceNode);
      return newNode;
    }
    return insertBefore.apply(this, arguments);
  };
})();
`;

export default function TranslationGuard() {
  return (
    <Script id="translation-guard" strategy="beforeInteractive">
      {guard}
    </Script>
  );
}
