/*jslint browser:true,esnext:true*/
/*globals App,Regle*/
class Prop{
	constructor() {

	}
	static creerLigneEdition() { //Pas fonctionnel
		var resultat, span;
		resultat = document.createElement('div');
		resultat.classList.add('prop');
		span = resultat.appendChild(document.createElement('span'));
		span.classList.add('case');
		span.classList.add('nom');
		span.setAttribute('contenteditable', true);

		resultat.appendChild(document.createTextNode(":"));

		span = resultat.appendChild(document.createElement('span'));
		span.classList.add('case');
		span.classList.add('val');
		span.setAttribute('contenteditable', true);
		resultat.appendChild(document.createTextNode(";"));
		return resultat;
	}
	static creerBtnAppliquer() {
		var resultat = App.dom_bouton('GO', this.evt.appliquer.click, 'appliquer');
		return resultat;
	}
	static creerBtnTransition() {
		var resultat = App.dom_bouton('Transition', this.evt.transition.click, 'transition');
		return resultat;
	}
	static creerBtnAjouter() {
		var resultat = App.dom_bouton('+', this.evt.ajouter.click, 'ajouter');
		return resultat;
	}
	static creerBtnIdClass() {
		var resultat = App.dom_bouton('Id et class', this.evt.idClass.click, 'idclass');
		return resultat;
	}
	/* Compose une règle pour la transition en fonction du selecteur donné ou des valeurs statiques */
	static regleTransition(selecteur) {
		var prefixe, resultat;
		prefixe = "body.transition ";
		selecteur = selecteur.toString();
		selecteur = selecteur.replace(/(^|,\s*)/g, "$1" + prefixe);
		resultat = selecteur + "{transition:" + this.dureeTransition + "s; -moz-transition:" + this.dureeTransition + "s; -webkit-transition:" + this.dureeTransition + "s}";
		return resultat;
	}
	static appliquerStyle(feuille, styleTxt) {
		if (feuille === undefined) {
			return this.appliquerStyle(document.querySelectorAll('#control .feuille'), styleTxt);
		}
		if (styleTxt instanceof HTMLElement) {
			return this.appliquerStyle(styleTxt.textContent);
		}
		styleTxt = this.regleTransition() + this.regle(styleTxt);
		this.style.innerHTML = styleTxt;
		return this;
	}
	static init() {
		console.log(this.name, "init");
		var self = this;
		this.dureeTransition = 2;
		this.control = null;
		this.evt = {
			appliquer: {
				click: function () {
					self.appliquerStyle();
				}
			},
			transition: {
				click: function () {
					document.body.classList.toggle('transition');
				}
			},
			ajouter: {
				click: function () {
					var regle = new Regle();
					regle.objFeuille.editable = true;
					App.ajouterControl(regle);
				}
			}
		};

	}
}
Prop.init();
