/**
 * [Module] Транслятор событий
 * [Author] Amagyzenér <dmitry-phs535@ya.ru>
 * [Version] 2.0.0 (08.05.2022)
 * [TODO]
*/

export class EventEmitter {
    /* [{ name: 'event:name-changed', callback: function() {}, once: false }, ...] */
    static #events = new Array;

    static on(name, callback, once = false) {
        if (!callback) return false;

        this.#events.push({ name, callback, once });
        return true;
    }

    static off(name, callback) {
        const idx = this.#events.findIndex(event => event.name == name && event.callback == callback);

        if (idx == -1) return false;

        this.#events.splice(idx, 1);
        return true;
    }

    static emit(name, ...args) {
        if (!this.#events.length) return false;

		this.#events.forEach(event => {
			if (event.name == name) {
				event.callback(...args);
				if (event.once) this.off(event.name, event.callback);
			}
		});

		return true;
    }

    static get events() {
        return this.#events;
    }
}