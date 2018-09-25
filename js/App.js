/*jslint browser:true,esnext:true*/
/*globals Prop, Regle*/
class App {
	/**
	 * Event callback called when everything is loaded : page and modules
	 * @returns {Promise} The Promise
	 */
	static load() {
		return new Promise(resolve => {
			var regle, props;
			if (this.page) {
				resolve(this.loadIframe(this.page));
			} else {
				this.initPage();
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
				this.ajouterControl(regle);
				resolve();
			}

			return resolve();
		});
	}
	static loadIframe(page) {
		return new Promise(resolve => {
			var iframe = document.body.appendChild(document.createElement("iframe"));
			var xhr = new XMLHttpRequest();
			xhr.open("get", page);
			xhr.addEventListener("load", function () {
				var reponse = this.responseText;
				var nouveau = '$1<base href="'+window.location.origin+'"/>';
				reponse = reponse.replace(/(<head[^>]*>)/, nouveau);
				iframe.setAttribute("src", "data:text/html;utf-8," + reponse);
				resolve(iframe);
			});
			xhr.send(null);
		});
	}
	/**
	 * Returns a promise resolved when given dependency (css or js) is fully loaded
	 * @param   {string|array} file URL to module dependancy
	 * @returns {Promise}      A Promise object
	 */
	static addDependency(dependency) {
		if (dependency instanceof Array) {
			return Promise.all(dependency.map(d => this.addDependency(d)));
		} else if (dependency instanceof Promise) {
			return dependency;
		} else if (typeof dependency === "object") {
			return this.addDependency(Object.values(dependency));
		} else if (dependency.endsWith(".js")) {
			return this.addModule(dependency);
		} else if (dependency.endsWith(".css")) {
			return this.addStyle(dependency);
		}
	}
	/**
	 * Returns a promise resolved when given module is fully loaded
	 * @param   {string|array} file URL to module file
	 * @returns {Promise}      A Promise object
	 */
	static addModule(file) {
		if (file instanceof Array) {
			return Promise.all(file.map(f => this.addModule(f)));
		} else {
			return new Promise(resolve => {
				var element = document.createElement("script");
				element.setAttribute("src", this.app_path(file));
//				element.setAttribute("type", "module");
				element.addEventListener("load", () => resolve(element));
				document.head.appendChild(element);
			});
		}
	}
	/**
	 * Returns a promise resolved when given css is fully loaded
	 * @param   {string|array} file URL to module file
	 * @returns {Promise}      A Promise object
	 */
	static addStyle(file) {
		if (file instanceof Array) {
			return Promise.all(file.map(f => this.addStyle(f)));
		} else {
			return new Promise(resolve => {
				var element = document.createElement("link");
				element.setAttribute("rel", "stylesheet");
				element.setAttribute("href", this.app_path(file));
				element.addEventListener("load", () => resolve(element));
				document.head.appendChild(element);
			});
		}
	}
	/**
	 * Returns a promise resolved when a json (or all jsons) is successfully loaded (and returned);
	 * @param   {string|array} url The url to json
	 * @returns {Promise}      A Promise object
	 */
	static loadJson(url) {
		if (url instanceof Array) {
			return Promise.all(url.map(u=>this.loadJson(u)));
		} else {
			return new Promise(function (resolve, reject) {
				var xhr = new XMLHttpRequest();
				xhr.open("get", url);
				xhr.responseType = "json";
				xhr.addEventListener("load", function () {
					resolve(this.response);
				});
				xhr.addEventListener("error", function () {
					reject(this);
				});
				xhr.send(null);
			});
		}
	}
	/**
	 * Returns an absolute URL to a file
	 * @param   {string} file Relative (or already absolute) file URL
	 * @param   {string} root The url on witch to base the absolute url
	 * @returns {string} An absolute URL
	 */
	static absolutePath(file = "", root = this._appPath) {
		if (file.match(/^[a-zA-Z0-9]+\:\/\//)) {
			return file;
		}
		if (!file) {
			return root;
		}
		return root + "/" + file;
	}
	/**
	 * Returns absolute URL to script folder
	 * @param   {string} file Optional. A file in the App.js's folder
	 * @returns {string} The absolute URL
	 */
	static app_path(file) {
		var result = this.absolutePath(file, this._appPath);
		return result;
	}
	/**
	 * Returns absolute URL to original page folder
	 * @param   {string} file Optional. A file in the page folder
	 * @returns {string} The absolute URL
	 */
	static page_path(file) {
		var result = this.absolutePath(file, this._pagePath);
		return result;
	}
	/**
	 * Sets static properties in reference to the page ans to the script
	 * Is called by init
	 */
	static setPaths() {
		var pageDir = window.location.href.split("/").slice(0, -1);
		this._pagePath = pageDir.join("/");
		var scriptDir = document.currentScript.getAttribute("src").split("/").slice(0, -1);
		// Clean up Current = ./ or Parent = ../
		scriptDir = scriptDir.filter(i=>i!==".");
		var pos;
		while (pos = scriptDir.indexOf(".."), pos >= 0) {
			if (pos === 0) {
				pageDir.pop();
				scriptDir.shift();
			} else {
				scriptDir.splice(pos-1, 2);
			}
		}
		// Absolute = http://
		if (scriptDir.length >= 1 && scriptDir[0].match(/^[a-zA-Z0-9]+\:$/)) {
			this._appPath = scriptDir.join("/");
			return;
		}
		// Protocole relative = //
		if (scriptDir.length >= 2 && scriptDir[0] === "" && scriptDir[1] === "") {
			this._appPath = pageDir.slice(0,2).concat(scriptDir.slice(2)).join("/");
			return;
		}
		// Domain relative = /
		if (scriptDir.length >= 1 && scriptDir[0] === "") {
			this._appPath = pageDir.slice(0,3).concat(scriptDir.slice(1)).join("/");
			return;
		}
		// Page relative
		this._appPath = pageDir.concat(scriptDir).join("/");
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
	static setEvents() {
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
	}
	/**
	 * Sets static properties and manages onload events
	 */
	static init() {
		console.log("init", this.name);
		this.src = document.head.lastElementChild.getAttribute("src");
		this.page = this.src.split("?").slice(1).join("?");
		this.setEvents();
		this.setPaths();
		this.loadJson("config.json").then((data) => {
			console.log(data);
			return Promise.all([
				new Promise(resolve => {
					window.addEventListener("load", () => resolve());
				}),
				this.addDependency([
					"../css/explorecss.css",
					"Prop.js",
					"Regle.js",
					"Selecteur.js",
					"Feuille.js",
				]),
			]);
		}).then(data => {
			console.log("Everything loaded", data);
			return Promise.all([
				this.load(),
			]);
		}).then(() => {
			console.log("Finished");
		});
	}
}
App.init();
