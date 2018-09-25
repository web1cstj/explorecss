/*jslint browser:true,esnext:true*/
/*globals Selecteur, Feuille, Prop*/
class Regle {
	constructor() {
		this.objSelecteur = new Selecteur(this);
		this.objFeuille = new Feuille(this);
		this._dom = null;
		this.style = null;
		this.style = document.createElement('style');
		this.style.setAttribute('type', "text/css");
		document.head.appendChild(this.style);
	}
	static init() {
		console.log(this.name, "init");

	}
	get dom() {
		if (!this._dom) {
			this.creerDom();
		}
		return this._dom;
	}
	get selecteur() {
		return this.objSelecteur.selecteur;
	}
	set selecteur(val) {
		this.objSelecteur.selecteur = val;
	}
	toString() {
		return this.regle();
	}
	appliquerStyle() {
		var styleTxt = Prop.regleTransition(this.objSelecteur) + this.regle();
		this.style.innerHTML = styleTxt;
		return this;
	}
	creerDom() {
		var resultat = document.createElement('div');
		resultat.classList.add('regle');
		resultat.appendChild(this.objSelecteur.dom);
		resultat.appendChild(this.objFeuille.dom);
		resultat.obj = this;
		this._dom = resultat;
		return resultat;
	}
	/* Compose une règle avec les props et le texte du dom */
	static regle(selecteur, props) {
		return selecteur + "{" + props + "}";
	}
	/* Compose une règle avec les props et le texte du dom */
	regle() {
		return Regle.regle(this.objSelecteur, this.objFeuille);
	}
}
Regle.init();
