class Keyboard{
    constructor(){
        this.keyCodes = {};
        this.modifiers = {};

        var self = this;
        this._onKeyDown = (event) => { self._onKeyChange(event, true) }
        this._onKeyUp = (event) => { self._onKeyChange(event, false) }

        document.addEventListener('keydown', this._onKeyDown, false);
        document.addEventListener('keyup', this._onKeyUp, false);

        this.MODIFIERS = ['shift', 'ctrl', 'alt', 'meta'];
        this.ALIAS = {
            'left': 37,
            'up': 38,
            'right': 39,
            'down': 40,
            'space': 32,
            'pageup': 33,
            'pagedown': 34,
            'tab': 9,
        };
    }

    destroy(){
        document.removeEventListener('keydown', this._onKeyDown, false);
        document.removeEventListener('keyup', this._onKeyUp, false);
    }

    _onKeyChange(event, pressed){
        let keyCode = event.keyCode;
        this.keyCodes[keyCode] = pressed;
        this.modifiers['shift'] = event.shiftKey;
        this.modifiers['ctrl'] = event.ctrlKey;
        this.modifiers['alt'] = event.altKey;
        this.modifiers['meta'] = event.metaKey;
    }

    pressed(keySelector, isPressed){
        let keys = keySelector.split('+');
        let pressed = false;
        let setValue = isPressed !== undefined;
        for(let i = 0; i < keys.length; i++){
            let key = keys[i];
            if(this.MODIFIERS.indexOf( key ) !== -1){
                if (setValue) this.modifiers[key] = isPressed;
                pressed = this.modifiers[key];
            }
            else if( Object.keys(this.ALIAS).indexOf( key ) !== -1 ){
                if (setValue) this.keyCodes[this.ALIAS[key]] = isPressed;
                pressed = this.keyCodes[ this.ALIAS[key] ];
            }
            else {
                if (setValue) this.keyCodes[key.toUpperCase().charCodeAt(0)] = isPressed;
                pressed = this.keyCodes[ key.toUpperCase().charCodeAt(0) ];
            }

            if( !pressed && !setValue) break;
        }
        return pressed;
    }
}