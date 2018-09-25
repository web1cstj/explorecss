/*jslint browser:true,esnext:true*/
/*globals App*/
class Selecteur {
	constructor(regle) {
		this.editable = true;
		this.regle = regle;
		this._selecteurConteneur = "#body";
		this._selecteur = "";
		this._dom = null;
		this.entete = null;
		this.style = null;
	}
	get selecteurConteneur() {
		return this._selecteurConteneur;
	}
	set selecteurConteneur(val) {
		if (val !== this._selecteurConteneur) {
			this._selecteurConteneur = val;
			this.appliquerStyle();
		}
		return this;
	}
	get selecteur() {
		return this._selecteur;
	}
	set selecteur(val) {
		val = Selecteur.normaliserSelecteur(val);
		if (val !== this._selecteur) {
			this._selecteur = val;
			this.appliquerStyle();
		}
		return this;
	}
	get dom () {
		if (!this._dom) {
			this.creerDom();
		}
		return this._dom;
	}
	static normaliserSelecteur(selecteur) {
		// &         -> Supprimer & (trim left)
		// +         -> &+ (trim)
		// >         -> &> (trim)
		// espace(s) -> espace
		// .         -> espace.
		// [         -> espace[
		// #         -> espace#
		// autre     -> espaceautre
		selecteur = selecteur
			.replace(/([^a-zA-Z0-9_\-]|^)body([^a-zA-Z0-9_\-]|$)/g, "$1&$2")
			.replace(/\s*([>+,])\s*/g, "$1") //Trim le + > ,
			.replace(/\s+/g, " ") //Enleve les espaces multiples
			.replace(/^\s+/g, "") //Enleve les espaces à gauche
			.replace(/(^|,)([\+\>])/g, "$1&$2") //Trim le + et >
			.replace(/(^|,)([^\&])/g, "$1& $2"); //Ajoute le & au besoin
		return selecteur;
	}
	toString() {
		return this.composerSelecteur();
	}
	creerDom() {
		var resultat;
		if (!this.editable) {
			this._dom = null;
			return this._dom;
		}
		resultat = document.createElement('div');
		resultat.obj = this;
		resultat.classList.add('groupe');
		resultat.classList.add('groupe-selecteur');
		this._dom = resultat;

		this.entete = resultat.appendChild(document.createElement('h1'));
		this.entete.obj = this;
		this.entete.innerHTML = 'Selecteur';

		this.feuille = resultat.appendChild(document.createElement('div'));
		this.feuille.obj = this;
		this.feuille.classList.add('selecteur');
		this.feuille.classList.add('edition');
		this.feuille.setAttribute('contenteditable', true);
		App.bind(this.feuille, this.evt.edition);

		return resultat;
	}
	/* Compose un selecteur en fonction des parametres */
	static composerSelecteur(selecteur, selecteurConteneur) {
		if (selecteurConteneur && selecteur) {
			selecteur = selecteur.replace(/&/g, selecteurConteneur);
		} else if (selecteurConteneur) {
			selecteur = selecteurConteneur;
		} else if (selecteur) {
			selecteur = selecteur.replace(/&/g, '');
		} else {
			selecteur = "*";
		}
		return selecteur;
	}
	/* Compose un selecteur en fonction des props et d'un prefixe donne optionnel (pour les anim) */
	composerSelecteur(prefixe) {
		var resultat = Selecteur.composerSelecteur(this.selecteur, this.selecteurConteneur);
		if (prefixe) {
			resultat = prefixe + " " + resultat.replace(/,/g, "," + prefixe + ' ');
		}
		return resultat;
	}
	appliquerStyle() {
		return this.regle.appliquerStyle();
	}
	static dom_bouton(texte, evt, classe) {
		var resultat = App.dom_bouton(texte, evt, classe);
		resultat.classList.add('obj-selecteur');
		return resultat;
	}
	dom_bouton(texte, evt, classe) {
		var resultat = Selecteur.dom_bouton(texte, evt, classe);
		resultat.obj = this;
		return resultat;
	}
	static init() {
		this.prototype.evt = {
			edition: {
				keyup: function (e) {
					switch (e.keyCode) {
					case 13:
						this.obj.selecteur = this.textContent;
						break;
					default:
						this.obj.selecteur = this.textContent;
					}
				},
				blur: function () {
					this.obj.selecteur = this.textContent;
				}
			}
		};
	}
}
Selecteur.init();
