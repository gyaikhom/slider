/* Copyright 2013 Gagarine Yaikhom (The MIT License) */
(function() {
    /**
     * Returns a substring of the string object after discarding characters
     * from either the start, or the end.
     *
     * <p>If the supplied number of characters to be discarded is
     * less than 0, they are discarded at the end; otherwise, they are
     * discarded from the start of the string. <i>The original string is
     * left unmodified.</i></p>
     *
     * @param {Integer} nchars Number of characters to discard.
     *
     * @return {String} A substring with the remaining characters.
     */
    String.prototype.discard = function (nchars) {
        var length = this.length - nchars;
        return nchars < 0 ? this.substr(0, length)
        : this.substr(nchars, length);
    }

    /**
     * Returns the current event.
     *
     * @param {Object} event Current event passed to event handler.
     */
    function aux_getEvent(event) {
        if(!event)
            event = window.event;
        return event;
    }

    /**
     * Attach an event handler to the specified node for the supplied event.
     *
     * @param node DOM node to attach event to.
     * @param event Name of the event to handle.
     * @param handler Function that will handle the event.
     */
    function aux_handleEvent(node, event, handler) {
        if (node.attachEvent)
            node.attachEvent('on' + event, handler)
        else if (node.addEventListener)
            node.addEventListener(event, handler, false)
    }

    /**
     * Returns the specified property for the supplied node.
     *
     * @param {Object} node DOM node whose property we seek.
     * @param {String} property Name of the property.
     */
    function aux_getPropertyValue(node, property) {
	var value = "", view = document.defaultView;
        if(view && view.getComputedStyle) {
            value = view.getComputedStyle(node, "").getPropertyValue(property);
        } else if(node.currentStyle){
            property = property.replace(/\-(\w)/g, function (str ,p1){
                return p1.toUpperCase();
            });
            value = node.currentStyle[property];
        }
        return value;
    }

    /**
     * Creates a new DOM node.
     * 
     * @param {Object} parent Parent DOM node to attach to.
     * @param {String} tag DOM node tag to use.
     * @param {String} id Identifier to use for the node.
     * @param {String} cls Style class for this node.
     * @param {String} text Text for inner HTML.
     */
    function aux_createNode(parent, tag, id, cls, text) {
        var node = document.createElement(tag);
        
        if (parent) parent.appendChild(node);
        else {
            throw new Error('Parent node required');
        }
        
        if (id) node.setAttribute('id', id);
        if (cls) node.setAttribute('class', cls);
        if (text !== undefined) node.innerHTML = text;
        return node;
    } 

    /**
     * Get or set DOM node attribute.
     *
     * @param {Object} node DOM node to process.
     * @param {String} attribute Name of the sttribute.
     * @param {String} value Optional new value for attribute.
     */
    function aux_attr(node, attribute, value) {
        if (node && attribute) {
            if (value === undefined)
                return node.getAttribute(attribute);
            else {
                return node.setAttribute(attribute, value);
            }
        }
        return null;
    }

    /**
     * Get or set style.
     * 
     * @param {Object} node DOM node to process.
     * @param {String} property Style property name.
     * @param {Integer} value Optional new value for property.
     */
    function aux_style(node, property, value) {
        if (value === undefined)
            return aux_getPropertyValue(node, property);
        else {
            node.style[property] = value;
            return value;
        }
    }

    /**
     * Get or set style where properties are dimensions in pixels.
     * 
     * @param {Object} node DOM node to process.
     * @param {String} property Style property name.
     * @param {Integer} value Optional new height.
     */
    function aux_styleDimension(node, property, value) {
        if (value === undefined)
            return parseInt(aux_getPropertyValue(node, property).discard(-2));
        else {
            node.style[property] = value + 'px';
            return value;
        }
    }

    /**
     * Get or set height.
     * 
     * @param {Object} node DOM node to process.
     * @param {Integer} height Optional new value.
     */
    function aux_height(node, height) {
        return aux_styleDimension(node, 'height', height);
    }
    
    /**
     * Get or set width.
     * 
     * @param {Object} node DOM node to process.
     * @param {Integer} width Optional new value.
     */
    function aux_width(node, width) {
        return aux_styleDimension(node, 'width', width);
    }

    /**
     * Get or set top placement.
     * 
     * @param {Object} node DOM node to process.
     * @param {Integer} top Optional new value.
     */
    function aux_top(node, top) {
        return aux_styleDimension(node, 'top', top);
    }

    /**
     * Get or set left placement.
     * 
     * @param {Object} node DOM node to process.
     * @param {Integer} left Optional new value.
     */
    function aux_left(node, left) {
        return aux_styleDimension(node, 'left', left);
    }

    /**
     * Get or set padding.
     * 
     * @param {Object} node DOM node to process.
     * @param {String} type Padding type.
     * @param {Integer} value Padding in pixels.
     */
    function aux_padding(node, type, value) {
        return aux_styleDimension(node, 'padding-' + type, value);
    }

    /**
     * Get or set margin.
     * 
     * @param {Object} node DOM node to process.
     * @param {String} type Margin type.
     * @param {Integer} value Margin in pixels.
     */
    function aux_margin(node, type, value) {
        return aux_styleDimension(node, 'margin-' + type, value);
    }

    /**
     * Get x-coordinate of mouse position from event.
     * 
     * @param {Object} event Mouse event.
     */
    function aux_pageX(event) {
        return event.pageX === undefined ? event.clientX : event.pageX;
    }

    /**
     * The following keeps track of the mouse events that are attached
     * with the documents.
     */
    var aux_mouseDown = false, aux_doc = window.document,
    aux_oldBodySelectStartHandler = aux_doc.onselectstart,
    aux_oldBodyMouseUpHandler = aux_doc.onmouseup;

    /**
     * We wish to disable text selection when we
     * we are dragging the slider button. Also, we want to disable
     * dragging when the mouse pointer is outside the slider.
     */
    aux_doc.onmouseup = function(event) {
        aux_mouseDown = false;
        aux_doc.onselectstart = aux_oldBodySelectStartHandler;
        if (aux_oldBodyMouseUpHandler)
            aux_oldBodyMouseUpHandler(aux_getEvent(event));
    }

    /**
     * Implements a Slider user interface.
     * 
     * @param {Object} parentId Unique identifier for container node.
     * @param {String} id Unique identifier for the slider.
     * @param {String} label The value label.
     * @param {Real} min Minimum value allowed.
     * @param {Real} max Maximum value allowed.
     * @param {Integer} height Maximum height for the slider in pixels.
     * @param {Integer} width Maximum width for the slider in pixels.
     * @param {Function} onValueChange Processing to do when value changes.
     * @param {Real} value Optional default value.
     */
    Slider = function(parentId, id, label, min, max, height,
        width, onValueChange, value) {
        this.parent = document.getElementById(parentId);
        if (this.parent === undefined) {
            throw new Error("Invalid container node");
            return;
        }

        this.id = id;
        this.minValue = min;
        this.maxValue = max;
        this.valueRange = max - min;

        /* if default value is unspecified, use the middle */
        this.defaultValue = value === undefined
        ? .5 * (this.maxValue - this.minValue) : value;

        this.onValueChange = onValueChange;
        this.sliderHeight = height;
        this.sliderWidth = width;
        this.labelText = label;
	
        this.renderSlider();
    };

    /**
     * Implement the functionalities.
     */
    Slider.prototype = {
        floatingPointRegEx:
        /^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?$/,

        /**
         * Returns the current slider value.
         */
        getSliderValue: function() {
            var me = this, currentValue = me.value.value;
            if (me.floatingPointRegEx.test(currentValue)) {
                currentValue = parseFloat(currentValue);
            } else {
                throw new Error('Invalid value');
            }
            return currentValue;
        },

        /**
         * Converts current slider value to slider button position.
         * This is used for updating the position of the slider button when
         * user updates the value text box.
         */
        positionFromValue: function() {
            var me = this, valueBox = me.value, value = valueBox.value;
            if (me.floatingPointRegEx.test(value)) {
                aux_style(valueBox, 'color', '#000'); /* valid value */
		
                value = parseFloat(value);

                /* keep value within range */
                if (value < me.minValue) {
                    value = me.minValue;
                    /* value is less than min */
                    aux_style(valueBox, 'color', 'green');
                } else if (value > me.maxValue) {
                    value = me.maxValue;
                    /* value is more than max */
                    aux_style(valueBox, 'color', 'blue');
                }
            } else {
                /* highlight error */
                aux_style(valueBox, 'color', '#f00');
                value = me.defaultValue;
            }
        
            return me.minButtonLeft + me.barWidth
            * (value - me.minValue) / me.valueRange; /* lerp */
        },
    
        /**
         * Converts current slider button position to slider value.
         * This is used for updating the slider value when the user drags the
         * slider button.
         */
        valueFromPosition: function() {
            var me = this, value;
            aux_style(me.value, 'color', '#000');
            value = me.minValue + me.valueRange * (aux_left(me.button)
                + .5 * me.buttonWidth - me.barLeft) / me.barWidth; /* lerp */
            return value;
        },

	getDragStartHandler: function(button) {
            return function(event) {
                aux_mouseDown = true;
                event = aux_getEvent(event);
                button.displacement = aux_left(button) - aux_pageX(event);

                /* prevent selection event when dragging */
                aux_doc.onselectstart = function () {
                    return false;
                }
            };
        },

        getDragHandler: function(button) {
            var me = this;
            return function(event) {
                event = aux_getEvent(event);
                if (aux_mouseDown) {
                    var newPosition = aux_pageX(event) + button.displacement;

                    /* keep slider button within range */
                    if (newPosition >= me.minButtonLeft
                        && newPosition <= me.maxButtonRight) {
                        aux_left(button, newPosition);
                        me.value.value = me.valueFromPosition();
                        if (me.onValueChange)
                            me.onValueChange(me.value.value);
                    }
                }
            };
        },

        /**
         * Attached event for implementing dragging event on slider button.
         */
        attachSliderDragHandler: function() {
            var me = this, sliderRegion = me.range, button = me.button,
            dragStart = me.getDragStartHandler(button),
            drag = me.getDragHandler(button);

            /**
             * Dragging event begins when user clicks on the slider button.
             */
            aux_handleEvent(button, 'touchstart', dragStart);
            button.onmousedown = dragStart;

            /**
             * Dragging continues when user moves the mouse over the slider
             * region when the mouse button is depressed.
             */
            aux_handleEvent(sliderRegion, 'touchmove', drag);
            sliderRegion.onmousemove = drag;
        },
    
        /**
         * The slider dimensions must be set based on the size of the labels,
         * supplied slider styling etc. Hence, these are calculated dynamically
         * after the components have been rendered.
         */
        refitSlider: function() {
            var me = this,
        
            /* vertical middle of the slider component */
            midHeight = me.sliderHeight * .5,
	
            /* label dimensions */
            labelWidth = aux_width(me.label),
            labelHeight = aux_height(me.label),
            labelTop = midHeight - labelHeight * .5,

            /* value box dimensions */
            valueWidth = aux_width(me.value)
            + aux_padding(me.value, 'left')
            + aux_padding(me.value, 'right')
            + aux_margin(me.value, 'left')
            + aux_margin(me.value, 'right'),
	
            valueHeight = aux_height(me.value)
            + aux_padding(me.value, 'top')
            + aux_padding(me.value, 'bottom'),
            valueTop = midHeight - valueHeight * .5,

            /* reset button dimensions */
	    resetWidth = aux_width(me.reset),
            resetHeight = aux_height(me.reset),
            resetTop = midHeight - resetHeight * .5,

            /* range contains the bar, button, reset and min and max labels */
            rangeWidth = me.sliderWidth - labelWidth - valueWidth - resetWidth
            - aux_padding(me.range, 'left')
            - aux_padding(me.range, 'right') - 2,
            rangeTop = 0,
            rangeHeight = me.sliderHeight,
        
            /* horizontal bar dimensions */
            barWidth = rangeWidth,
            barHeight = aux_height(me.bar),
            barTop = midHeight - barHeight * .5,
            barLeft = aux_padding(me.range, 'left'),
        
            /* slider button dimensions */
            buttonHeight = aux_height(me.button),
            buttonTop = midHeight - buttonHeight * .5,

            /* min label dimensions */
            minWidth = aux_width(me.min),
            minHeight = aux_height(me.min),
            minTop = midHeight + buttonHeight * .5 + minHeight * .25,
            minLeft = barLeft - minWidth * .5,

            /* max label dimensions */
            maxWidth = aux_width(me.max),
            maxTop = minTop,
            maxLeft = barLeft + rangeWidth - maxWidth * .5;
        
            /* the following values are used when converting slider value to
             * button position, and vice versa */
            me.buttonWidth = aux_width(me.button);
            me.halfButtonWidth = .5 * me.buttonWidth;
            me.barLeft = barLeft;
            me.barRight = barLeft + barWidth;
            me.barWidth = barWidth;
            me.minButtonLeft = barLeft - me.halfButtonWidth;
            me.maxButtonRight = me.barRight - me.halfButtonWidth;

            /* using the dimensions just calculated, resize components */
            aux_width(me.slider, me.sliderWidth);
            aux_height(me.slider, me.sliderHeight);

            aux_top(me.label, labelTop);
            aux_top(me.value, valueTop);
            aux_top(me.range, rangeTop);
            aux_width(me.range, rangeWidth);
            aux_height(me.range, rangeHeight);
        
            aux_top(me.bar, barTop);
            aux_width(me.bar, barWidth);
            aux_left(me.bar, barLeft);
        
            aux_top(me.button, buttonTop);
            aux_width(me.button, me.buttonWidth);
        
            aux_top(me.min, minTop);
            aux_left(me.min, minLeft);
            aux_top(me.max, maxTop);
            aux_left(me.max, maxLeft);

	    me.setValue();

            return me;
        },
    
        /**
         * Render the components of the slider by adding DOM nodes for each of
         * the components. Note that the identifier for each of the components
         * are derived from the slider identifier.
         */
        renderSlider: function() {
            var me = this, id = me.id, prefix = 'slider';
        
            /* contains the entire slider */
            me.slider = aux_createNode(me.parent, 'div', id, prefix);
        
            /* slider label */
            me.label = aux_createNode(me.slider, 'div',
                id + '-label', prefix + '-label', me.labelText);
        
            /* editable slider value box */
            me.value = aux_createNode(me.slider, 'input',
                id + '-value', prefix + '-value');
        
            /**
             * Attach event handler that updates slider button position when the
             * value in this box changes
             */
            me.value.onkeyup = function(event) {
		me.setValue(me.value.value);
            };
             
            /* range contains the bar, button, and min and max labels */
            me.range = aux_createNode(me.slider, 'div',
                id + '-range', prefix + '-range');
            me.bar = aux_createNode(me.range, 'div',
                id + '-bar', prefix + '-bar');
            me.button = aux_createNode(me.range, 'div',
                id + '-button', prefix + '-button');

	    /* resets the value to default */
            me.reset = aux_createNode(me.range, 'div',
                id + '-reset', prefix + '-reset');
            aux_attr(me.reset, 'title', 'Reset slider value');
            aux_handleEvent(me.reset, 'click', function() {
                me.setValue();
            });

            me.min = aux_createNode(me.range, 'div',
                id + '-min', prefix + '-min', me.minValue);
            me.max = aux_createNode(me.range, 'div',
                id + '-max', prefix + '-max', me.maxValue);
        
            me.refitSlider();
            me.attachSliderDragHandler(me);

            me.value.value = me.defaultValue;
	    me.onValueChange(me.value.value);

            return me;
        },

	setValue: function(value) {
            var me = this;
            me.value.value = value === undefined ? me.defaultValue : value;
            me.buttonLeft = me.positionFromValue();
            aux_left(me.button, me.buttonLeft);
            me.onValueChange(me.defaultValue);
        },

        hideSlider: function() {
            aux_style(this.slider, 'visibility', 'hidden');
        },

        showSlider: function() {
            aux_style(this.slider, 'visibility', 'visible');
        }
    };
})();
