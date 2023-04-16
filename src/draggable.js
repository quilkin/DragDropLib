
class Element {
    constructor(el) {
        this.el = el
        this.currentX = null;
        this.currentY = null;
        this.savedBackground = null;
      
    }
    get clientRect() {
        return this.el.getBoundingClientRect();
    }

    saveOriginalPos() {
        //const elRect = this.el.getBoundingClientRect();
        this.currentX = this.clientRect.left - this.parentLeft;
        this.currentY = this.clientRect.top - this.parentTop;
    }
    get parent() {
        const _parent = this.el.parentElement;
        if (_parent == null)
            throw 'element with id ' + this.el.id + ' has no parent';
        return _parent;
    }

    get parentLeft() {
        const left = this.parent.getBoundingClientRect().left;
        return left;
    }
    get parentTop() {
        const top = this.parent.getBoundingClientRect().top;
        return top;
    }
    get background() {
        return this.el.style.background
    }
    set background(colour) {
        this.el.style.background = colour;
    }

    dragTo(x, y) {
        const moveFromLeft = x - this.parentLeft ;
        const moveFromTop =  y - this.parentTop ; 

        this.el.style.left = `${moveFromLeft}px`
        this.el.style.top = `${moveFromTop}px`
    }
    moveTo(x, y) {
        if (x === NaN || y ===NaN)
            throw 'invalid argument(s) for moveTo()';
        const leftPosition = x ;
        const topPosition = y ;
        this.el.style.left = `${leftPosition}px`;
        this.el.style.top = `${topPosition}px`;
         this.currentX = x;
         this.currentY = y;
    }
}

export class Draggable extends Element{
    constructor(elem,id) {
        super(elem,id);
        
        this.isTouch = false;
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onTouchStart = this.onTouchStart.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onTouchEnd = this.onTouchEnd.bind(this);
        this.onMouseOver= this.onMouseOver.bind(this);
        this.onMouseOut = this.onMouseOut.bind(this);

        this.addEventHandlers();
        this.currentDroppable = null;
        this.copiedElement =  null;
        this.droppedRect = null;

    }

    static #nextFreeId = 1000;
    static #lastStartDragTime = 0;
    static startTimeLimit = 250;
    static throttlePeriod = 100;
    static #lastDragTime = 0;
    static logging = false;
    static draggableBackground = 'lightgreen';
    static droppableBackground = 'pink';
    static xDragOffset = 5;
    static yDragOffset = 5;
    static moveCursor = 'grab';
   
    get isSwappable()
    {
        // when dropped, the two items (dragged from and dropped to) will swap over
         return this.el.classList.contains('swappable')
    }
    get isCopyable()
    {
        // when dropped, the original item will keep a copy of itself (i.e. won't move or disappear)
        return this.el.classList.contains('copyable')
    }
    get isMovable()
    {
        // when dropped, the original item will disappear)
        return this.el.classList.contains('movable')
    }
    get isChangeClass()
    {
        // after moving or copying, this element will acquire class of item dropped onto
        // (default is to keep original class)
        return this.el.classList.contains('changeclass')
    }

    addEventHandlers() {
        document.addEventListener('mousedown', this.onMouseDown);
        document.addEventListener('touchstart', this.onTouchStart);
        document.addEventListener('dragstart', e => e.preventDefault());
        document.addEventListener('mouseover', this.onMouseOver);
        document.addEventListener('mouseout', this.onMouseOut);

    }
    addEvent(name,droppedFrom, droppedTo) {
        const event = new CustomEvent(name, { detail: {from:droppedFrom.id, to:droppedTo.id }});
        document.dispatchEvent(event);
    }
    prepareMove(e) {

        var now = e.timeStamp;
        if (now - Draggable.#lastStartDragTime  < Draggable.startTimeLimit) {
            // debounce
            return false;
        }

        Draggable.#lastStartDragTime = now;
        this.currentDroppable = null;
 
        // save pos so that we can restore it later
        this.saveOriginalPos();

        if (this.isSwappable && this.copiedElement===null)
            this.copyElement(e,true);

        else if (this.isCopyable )
            this.copyElement(e,false);
        this.dragTo(this.clientRect.left + 5, this.clientRect.top + 5)
        return true;
    }
    onMouseOver(e) {
        this.el.style.cursor = Draggable.moveCursor;
    }
    onMouseOut(e) {
        this.el.style.cursor = 'default';
    }
    onMouseDown(e) {
        try {
            if (e.target.id != this.el.id) 
                    return;
            if (this.prepareMove(e) === false)
                return;
            document.addEventListener('mousemove', this.onMouseMove,true);
            document.addEventListener('mouseup', this.onMouseUp,true)
        }
        catch(err) {
             Draggable.exception(err);
        }
    }

    onTouchStart(e) {
        try {
            this.isTouch = true;
            if (e.touches.length > 1) return;

            let et = e.touches[0];
            if (et.target.id != this.el.id)
                return;

            if (this.prepareMove(et) === false)
                return;
            document.addEventListener('touchmove', this.onMouseMove,true);
            document.addEventListener('touchend', this.onTouchEnd,true);
        }
        catch(err) {
            Draggable.exception(err);
        }
    }
    
    copyElement(e,swappable) {

        this.copiedElement = new Draggable(e.target.cloneNode(true));
        // copy needs a  new ID otherwise the wrong element may be replaced later
        this.copiedElement.el.id = Draggable.nextId;
        if (swappable) {
            // save for re-instating after drop
            this.savedBackground = this.background;
            this.copiedElement.background = Draggable.draggableBackground;
        }
        else {
            // new element so it needs new handlers
            this.copiedElement.addEventHandlers()
        }
        this.parent.appendChild(this.copiedElement.el);
        this.copiedElement.moveTo(this.currentX,this.currentY)
    }
        
    onMouseMove(e) {
    try {

        var now = e.timeStamp;
        if (now - Draggable.#lastDragTime  < Draggable.throttlePeriod) {
            return ;
        }
        Draggable.#lastDragTime = now;

        if (this.isTouch) {
            if (e.touches.length > 1) return;
            e = e.touches[0];
        }

        // keep mouse inside element during drag, so that cursor defined by 'mouseover' stays with it
        this.dragTo(e.clientX - Draggable.xDragOffset, e.clientY - Draggable.yDragOffset);

        this.hidden = true;
        var elemBelow = document.elementFromPoint(e.clientX - Draggable.xDragOffset,e.clientY - Draggable.yDragOffset);
        this.hidden = false;

        if (!elemBelow) return;

        if (elemBelow.id === this.el.id)
            // same element is underneath; not dragged enough yet
            return;

        let closest = elemBelow.closest('.droppable');

        if (closest === null) {
            if (this.currentDroppable)
                this.currentDroppable.background = '';
            this.currentDroppable = null;
            return;
        }

        if (closest.id === this.el.id)
            // don't want to drop onto itself
            return;

        if (this.copiedElement && this.copiedElement.el.id === closest.id)
            return;

        const droppableBelow = new Element(closest);
 
        if (this.currentDroppable === null || this.currentDroppable.el.id != droppableBelow.el.id) {

            if (this.currentDroppable != null) { // null when we were not over a droppable before this event
                this.currentDroppable.background = '';
            }

            this.currentDroppable = droppableBelow;
            if (this.currentDroppable) { 
                // null if we're not coming over a droppable now (maybe just left the droppable)
                this.currentDroppable.background = Draggable.droppableBackground;
                this.droppedRect = this.currentDroppable.el.getBoundingClientRect();
            }
        }
    }
        catch(err) {
            Draggable.exception(err);
        }
    }

    endAction(e) {
        if (this.currentDroppable) {
            if (this.currentDroppable.el.id === this.el.id)
               // don't drop on itself
                return;

            var dropParent = this.currentDroppable.el.parentElement;
            if (dropParent === null)
            {
                Draggable.log("null parent: " + this.currentDroppable.el.id)
                return;
            }
            var droppedOnElement = this.currentDroppable;

            Draggable.logReplacement(this,droppedOnElement);
            dropParent.replaceChild(this.el,droppedOnElement.el);

            const x = this.droppedRect.left - this.parentLeft;
            const y = this.droppedRect.top - this.parentTop;
            this.moveTo(x,y);

            if (this.isSwappable && this.copiedElement)
            {
                this.addEvent('swapped',this.el,droppedOnElement.el);
             
                // replace the original moved item with what was at the dropped position
                var originalParent = this.copiedElement.parent;
                Draggable.logReplacement(droppedOnElement,this.copiedElement);
                originalParent.replaceChild(droppedOnElement.el,this.copiedElement.el);

                droppedOnElement.moveTo(this.copiedElement.currentX,this.copiedElement.currentY);
                droppedOnElement.background = this.savedBackground;

                this.copiedElement = null;
            }
            else if (this.isCopyable || this.isMovable) {
                this.addEvent('dropped',this.el,droppedOnElement.el);

                this.copiedElement = null;
                if (this.isChangeClass) {
                    this.el.classList = droppedOnElement.el.classList;
                }
            }
            this.currentDroppable = null;
        }
        else if (this.isMovable) {
            // not dropped on an element
            // replace the dragged item back to its original pos
            this.moveTo(this.currentX,this.currentY);
        }
        else if (this.copiedElement != null) {
            // not dropped on an element
            // remove the copy and replace the dragged item back to its original pos
            const origPosX = this.copiedElement.currentX ;
            const origPosY = this.copiedElement.currentY ;

            this.copiedElement.el.remove();
            this.copiedElement = null;
            this.moveTo(origPosX,origPosY);
        }
    }

    onMouseUp(e) {
        try {
            this.endAction(e);
        }
        catch(err) {
            Draggable.exception(err);
        }
        finally {
            document.removeEventListener('mousemove', this.onMouseMove,true);
            document.removeEventListener('mouseup', this.onMouseUp,true);
        }
    }
    onTouchEnd(e) {
        try {
            let et = e.changedTouches[0];
            if (et===null || et===undefined )   throw "null event";
            this.endAction(et);
        }
        catch(err) {
            Draggable.exception(err);
        }
        finally {
            document.removeEventListener('touchmove', this.onMouseMove,true);
            document.removeEventListener('mouseup', this.onMouseUp,true);
        }
    }
    static log(str)
    {
        if (Draggable.logging)   console.log(str);
    }
    static logReplacement(a,b)
    {
        Draggable.log('replacing id ' + a.el.id + ' with id ' + b.el.id);
    }
    static exception(err)
    {
        Draggable.log('exception: ' + err);
    }
    static init() {
        const draggables = document.querySelectorAll('.copyable,.movable,.swappable');

        for (let draggable of draggables) {
            new Draggable(draggable)
        }
    }
    static get nextId()  {
        Draggable.#nextFreeId += 1;
        return Draggable.#nextFreeId;
    }

}







