/*
 * @author khisamutdinov radik
 * email mozg1984@gmail.com
 * @license GNU GPLv3
 *
 * Note: supports only ten placeholders
 */
(function (global, undefined) {
	var module = global.placeholders || {};
	if (typeof module != 'object') {
		throw new Error("Can not import module <placeholders> in global namespace");
	}
	
	var slice = Array.prototype.slice,
		concat = Array.prototype.concat,
		call = Function.prototype.call,
		apply = Function.prototype.apply;
	
	var placeholders = {
		_1: '_1', _2: '_2', _3: '_3', _4: '_4', _5: '_5',
		_6: '_6', _7: '_7', _8: '_8', _9: '_9', _10: '_10'
	};
	
	// indexes for mapping arguments by placeholders
	var indexes = {
		_1: 0, _2: 1, _3: 2, _4: 3, _5: 4,
		_6: 5, _7: 6, _8: 7, _9: 8, _10: 9
	};
	
	/**
	* Prototype inheritance 
	* @param {function} fn1
	* @param {function} fn2
	* @returns {function}
	*/
	var proto = function (fn1, fn2) {
		if (fn2 && fn2.prototype) {
			// Function.prototype doesn't have a prototype property
			fn1.prototype = fn2.prototype;
			fn1.prototype.constructor = fn2;
		}
		return fn1;
	};
	
	/**
	* Marking of the given function 
	* @param {function} fn
	* @returns {function}
	*/
	var mark = function (fn) {
		fn._ = +new Date;
		return fn;
	};
	
	/**
	* Checking if the given function has marked  
	* @param {function} fn
	* @returns {function}
	*/
	var hasMark = function (fn) {
		return fn._ != undefined;
	};
	
	/**
	* Binding of the given function with parameters 
	* @param {function} fn
	* @param {arguments} args...
	* @returns {function}
	*/
	module.bind = function (fn /* args... */) {
		if (this instanceof module.bind) {
			throw new Error("The method <bind> does not support the instantiation");
		}
		
		var _args = slice.call(arguments, 1),
			_vals = concat.call(_args);		
		
		var wrapper = function (/* args... */) {
			var args = slice.call(arguments),
				len = args.length;
			
			for (var i = 0; i < _args.length; i++) {
				if (_args[i] in (placeholders)) {
					if (indexes[_args[i]] > (len - 1)) {
						throw new Error("Can not find value for <" + _args[i] + "> placeholder");
					}
					
					_vals[i] = args[indexes[_args[i]]];
				}
				
				if (typeof _args[i] == 'function' && hasMark(_args[i])) {
					_vals[i] = _args[i].apply(this, args);
				}
			}
			
			return fn.apply(this, _vals);			
		};
		
		return mark(proto(wrapper, fn));
	};
	
	/**
	* Binding of the given function with context
	* @param {function} fn
	* @param {object} context
	* @returns {function}
	*/
	module.context = function (fn, context) {
		if (Function.prototype.bind == undefined) {
			var wrapper = proto(function () {
				context = this instanceof wrapper ? this : context;
				return call.apply(apply, [fn, context, arguments]); 
			}, fn);
			return wrapper;
		}
		
		return fn.bind(context);
	};

	// import placeholders to module
	for (var placeholder in placeholders) {
		module[placeholder] = placeholders[placeholder];
	}
	
	// import module to global namespace
	global.placeholders = module;
})(this);
