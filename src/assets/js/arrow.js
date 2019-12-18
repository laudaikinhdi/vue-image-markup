// Extended fabric line class
import {fabric} from 'fabric';
fabric.LineArrow = fabric.util.createClass(fabric.Line, {

    type: 'lineArrow',

    initialize: function(element, options) {
        options || (options = {});
        this.callSuper('initialize', element, options);

    },

    toObject: function() {

        return fabric.util.object.extend(this.callSuper('toObject'));

    },

    _render: function(ctx) {

        this.callSuper('_render', ctx);
        if (this.width === 0 || this.height === 0 || !this.visible) return;

        ctx.save();

        let xDiff = this.x2 - this.x1;
        let yDiff = this.y2 - this.y1;
        let angle = Math.atan2(yDiff, xDiff);
        ctx.translate((this.x2 - this.x1) / 2, (this.y2 - this.y1) / 2);
        ctx.rotate(angle);
        ctx.beginPath();
        //move 10px in front of line to start the arrow so it does not have the square line end showing in front (0,0)
        ctx.moveTo(10, 0);
        ctx.lineTo(-20, 15);
        ctx.lineTo(-20, -15);
        ctx.closePath();
        ctx.fillStyle = this.stroke;
        ctx.fill();
        ctx.restore();

    }
});

fabric.LineArrow.fromObject = function(object, callback) {
    callback && callback(new fabric.LineArrow([object.x1, object.y1, object.x2, object.y2], object));
};

fabric.LineArrow.async = true;

export default (function () {
    let drag;
    let color;
    let lineWidth;
    let fillArrow;
    let properties;
    function Arrow(canvas,draggable = false,params) {

        if(!draggable){
            drag = false;
            return Arrow;
        }

        if(color && color !== params.stroke){
            color = params.stroke;
            drag = true;
            return Arrow;
        }

        properties = params;
        if(properties){
            fillArrow = params.fill;
            color = params.stroke;
            lineWidth = params.strokeWidth;
        }
        this.canvas = canvas;
        this.className = 'Arrow';
        this.isDrawing = false;
        this.bindEvents();
        drag = draggable;

    }

    Arrow.prototype.bindEvents = function () {
        let inst = this;
        document.onkeydown=(e)=>{
            if(e.which === 46 || e.keycode === 46){
                inst.canvas.getActiveObjects().forEach((obj) => {
                    inst.canvas.remove(obj)
                });
            }
            inst.canvas.renderAll()
        };
        inst.selectable = true;
        
            inst.canvas.off('mouse:down');
            inst.canvas.on('mouse:down', function (o) {
                inst.onMouseDown(o);
            });
            inst.canvas.on('mouse:move', function (o) {
                inst.onMouseMove(o);
            });
            inst.canvas.on('mouse:up', function (o) {
                inst.onMouseUp(o);
                
            });
            inst.canvas.on('object:moving', function () {
                inst.disable();
            });
            

    };
    Arrow.prototype.onMouseUp = function () {
        
        let inst = this;
        if (!inst.isEnable()) {
            return;
        }

        if(drag){
            if(inst.canvas.getActiveObject()){
                inst.canvas.getActiveObject().hasControls = false;
                inst.canvas.getActiveObject().hasBorders = false;
                inst.canvas.getActiveObject().lockMovementX = true;
                inst.canvas.getActiveObject().lockMovementY = true;
                inst.canvas.getActiveObject().lockUniScaling = true;
            }
            inst.canvas.renderAll();
        }
        inst.disable();
    

    };
    Arrow.prototype.onMouseMove = function (o) {
        let inst = this;
        inst.canvas.selection = false;
        if (!inst.isEnable()) {
            return;
        }

        let pointer = inst.canvas.getPointer(o.e);
        let activeObj = inst.canvas.getActiveObject();
        activeObj.set({
            x2: pointer.x,
            y2: pointer.y
        });
        activeObj.setCoords();
        inst.canvas.renderAll();
    };

    Arrow.prototype.onMouseDown = function (o) {

        let inst = this;
        if(!drag){
            if( inst.canvas.getActiveObject()){
                inst.canvas.getActiveObject().hasControls = true;
                inst.canvas.getActiveObject().hasBorders = true;
                inst.canvas.getActiveObject().lockMovementX = false;
                inst.canvas.getActiveObject().lockMovementY = false;
                inst.canvas.getActiveObject().lockUniScaling = false;
                inst.canvas.renderAll();
            }
            inst.disable();
            return;
        }
        inst.enable();
        if(inst.canvas.getActiveObject()){
            inst.canvas.getActiveObject().hasControls = false;
            inst.canvas.getActiveObject().hasBorders = false;
            inst.canvas.getActiveObject().lockMovementX = true;
            inst.canvas.getActiveObject().lockMovementY = true;
            inst.canvas.getActiveObject().lockUniScaling = true;
            inst.canvas.renderAll();
        }
        let pointer = inst.canvas.getPointer(o.e);
        let points = [pointer.x, pointer.y, pointer.x, pointer.y];
        let line = new fabric.LineArrow(points, {
            strokeWidth: lineWidth,
            fill: color,
            stroke: color,
            originX: 'center',
            originY: 'center',
            hasBorders: false,
            hasControls: false
        });

        inst.canvas.add(line).setActiveObject(line);

    };

    Arrow.prototype.isEnable = function () {
        return this.isDrawing;
    };

    Arrow.prototype.enable = function () {
        this.isDrawing = true;
    };

    Arrow.prototype.disable = function () {
        this.isDrawing = false;
    };

    return Arrow;
}());
