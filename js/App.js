/*jslint browser:true,esnext:true*/
/*globals Prop, Regle*/
class App {
	constructor() {

	}
	static bind(object, events) {
		for (var name in events) {
			object.addEventListener(name, events[name]);
		}
		return this;
	}
	static unbind(object, events) {
		for (var name in events) {
			object.removeEventListener(name, events[name]);
		}
		return this;
	}
	static initPage() {
		var divbody = document.createElement("div");
		divbody.setAttribute("id", "body");
		this.control = this.creerControl();
		var elements = [].slice.call(document.body.childNodes, 0);
		while (elements.length) {
			divbody.appendChild(elements.shift());
		}
		document.body.appendChild(divbody);
		document.body.appendChild(this.control);
		return this;
	}
	static creerControl() {
		var resultat, h1, div;
		resultat = document.createElement('div');
		resultat.setAttribute('id', 'control');
		resultat.classList.add("gros");

		h1 = resultat.appendChild(document.createElement('h1'));
		h1.innerHTML = "Explorez...";
		h1.appendChild(Prop.creerBtnTransition());
		h1.appendChild(Prop.creerBtnAjouter());
		div = resultat.appendChild(document.createElement('div'));
		div.classList.add("body");
		resultat.body = div;
		return resultat;
	}
	static dom_bouton(texte, evt, classe) {
		var resultat;
		resultat = document.createElement('span');
		resultat.classList.add('bouton');
		resultat.innerHTML = texte;
		resultat.addEventListener("click", evt);
		if (classe) {
			resultat.classList.add(classe);
		}
		return resultat;
	}
	static ajouterControl(objet) {
		var resultat, resultats, nb;
		resultat = document.createElement('div');
		resultat.classList.add('control-section');
		resultat.appendChild(objet.dom);
		document.getElementById("control").body.appendChild(resultat);
		resultats = document.querySelectorAll('#control>div>*.control-section');
		nb = resultats.length;
//		resultats.style.height = (100 / nb) + '%';
//		resultat.appendChild(App.dom_barre());
		return this;
	}
	static dom_barre() {
		var resultat;
		resultat = document.createElement("div");
		resultat.classList.add("barre");
		this.bind(resultat, this.evt.barre);
		return resultat;
	}
	static init() {
		this.src = document.head.lastElementChild.getAttribute("src");
		this.page = this.src.split("?").slice(1).join("?");
		this.evt = {
			barre: {
				click : function () {
					this.parentNode.style.flexBasis = (parseFloat(this.parentNode.style.flexBasis || 0) + 1) + "em";
				},
				zzzmousedown: function (e) {
					this.depart = e;
					this.depart.taille = this.parentNode.clientHeight;
					App.bind(this, App.evt.barre_move);
				}
			},
			barre_move: {
				mouseup: function () {
					App.bind(this, App.evt.barre_move);
//					debugger;
				},
				mouseout: function () {
//					alert("WOOO!");
				},
				mousemove: function (e) {
					this.style.top = (e.clientY - this.depart.clientY) + "px";
//					debugger;
				},

			}
		};
		window.addEventListener("load", function () {
			var regle, props;
			if (App.page) {
				var iframe = document.body.appendChild(document.createElement("iframe"));
				var xhr = new XMLHttpRequest();
				xhr.open("get", App.page);
				xhr.addEventListener("load", function () {
			debugger;
					var reponse = this.responseText;
					var nouveau = '$1<base href="'+window.location.origin+'"/>';
					reponse = reponse.replace(/(<head[^>]*>)/, nouveau);
					iframe.setAttribute("src", "data:text/html;utf-8," + reponse);
				});
				xhr.send(null);
			} else {
				App.initPage();
				regle = new Regle();
				regle.objFeuille.editable = true;
				props = "";
				props += "border:1px solid black;\r\n";
				props += "border-radius:1em;\r\n";
				props += "padding:.25em;\r\n";
				props += "margin:.25em; \r\n";
				props += "background-color:rgba(0,0,0,.1);\r\n";
				props += "box-shadow:2px 2px 3px rgba(0,0,0,.5);\r\n";
				props += "text-shadow:1px 1px 1px rgba(0,0,0,.5);\r\n";
				props += "font-size:1em;\r\n";
				//props += "animation:boing .5s;\r\n";
				regle.objFeuille.props = props;
				App.ajouterControl(regle);
			}
		});
	}
}
App.init();
