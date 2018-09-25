/*jslint browser:true,esnext:true*/
/*globals App*/
class Feuille {
	constructor(regle) {
		this.editable = true;
		this.regle = regle;
		this._dom = null;
		this.entete = null;
		this.feuille = null;
		this._props = "";
	}
	static init() {
		this.evt = {
			feuille: {
				blur: function () {
					this.obj.props = this.obj.feuille.textContent;
				},
				keypress: function (e) {
						//console.log(e.which, e.keyCode, e.charCode);
					if (e.keyCode === 39 || e.keyCode === 40 || e.keyCode === 13 || e.which === 59) {
						this.maj = true;
					}
					/*if (e.charCode = 61 && (e.ctrlKey || e.metaKey)) {
						debugger;
						e.stopPropagation();
						//e.preventDefault();
					}*/
					//this.obj.props = this.obj.feuille.textContent;
				},
				keyup: function () {
					if (this.maj) {
						this.obj.props = this.obj.feuille.textContent;
						console.log("maj");
						delete this.maj;
					}
				}
			},
			elements: {
				click: function () {
					this.obj.selecteur = (this.obj.selecteur === "&>*") ? "" : "&>*";
				}
			},
			balise: {
				click: function () {
					var balisesValides, balise;
					balisesValides = ",h1,h2,h3,p,div,";
					balise = window.prompt("Quelle balise ?", this.obj.selecteur.substr(2).replace('*', ''));
					if (!balise || balisesValides.indexOf("," + balise + ",") === -1) {
						this.obj.selecteur = "";
					} else {
						this.obj.selecteur = ">" + balise;
					}
				}
			}
		};
	}
	get dom() {
		if (!this._dom) {
			this.creerDom();
		}
		return this._dom;
	}
	get props() {
		return this._props;
	}
	set props(val) {
		if (val === this._props) {
			return this;
		}
		this._props = val;
		this.appliquerStyle();
		var dom = this.dom;
		if (!dom) {
			return this;
		}
		dom.classList.remove("elements");
		dom.classList.remove("balise");
		if (this.feuille.innerHTML !== this._props) {
			this.feuille.innerHTML = this._props;
		}
	}
	get selecteur() {
		return this.regle.selecteur;
	}
	set selecteur(val) {
		var dom;
		this.regle.selecteur = val;
		val = this.regle.selecteur;
		dom = this.dom;
		if (!dom) {
			return this;
		}
		dom.classList.remove("elements");
		dom.classList.remove("balise");
		if (val === "&>*") {
			dom.classList.add('elements');
		} else if (val !== "") {
			dom.classList.add('balise');
		}
	}
	toString() {
		return this.props;
	}
	creerDom() {
		var resultat;
		if (!this.editable) {//TODO Vérifier l'utilité
			this._dom = null;
			return this._dom;
		}
		resultat = document.createElement('div');
		resultat.obj = this;
		resultat.classList.add("groupe");
		resultat.classList.add("groupe-proprietes");
		this._dom = resultat;
		this.entete = resultat.appendChild(document.createElement('h1'));
		this.entete.obj = this;
		this.entete.textContent = 'Propriétés';

		if (!this.regle.objSelecteur.editable) {
			this.entete.appendChild(this.creerBtnBalise());
			this.entete.appendChild(this.creerBtnElements());
		}
		this.feuille = resultat.appendChild(document.createElement('div'));
		this.feuille.obj = this;
		this.feuille.classList.add('feuille');
		this.feuille.classList.add('edition');
		this.feuille.setAttribute('contenteditable', true);
		App.bind(this.feuille, Feuille.evt.feuille);

		return this;
	}
	static dom_bouton(texte, evt, classe) {
		var resultat = App.dom_bouton(texte, evt, classe);
		resultat.classList.add('obj-feuille');
		return resultat;
	}
	dom_bouton(texte, evt, classe) {
		var resultat = Feuille.dom_bouton(texte, evt);
		if (classe) {
			resultat.classList.add(classe);
		}
		resultat.obj = this;
		return resultat;
	}
	creerBtnElements() {
		var resultat = this.dom_bouton('Elements', Feuille.evt.elements.click, 'elements');
		return resultat;
	}
	creerBtnBalise() {
		var resultat = this.dom_bouton("&lt; &gt;", Feuille.evt.balise.click, 'balise');
		return resultat;
	}
	appliquerStyle() {
		return this.regle.appliquerStyle();
	}
}
Feuille.init();
