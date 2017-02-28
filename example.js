// example 1:

var foo1 = function (n1, n2, n3, n4) {
    console.log("n1 = " + n1 + ", n2 = " + n2 + ", n3 = " + n3 + ", n4 = " + n4.val);
}

var foo2 = function (n1, n2, n3, n4) {
    console.log("n1 = " + n1 + ", n2 = " + n2 + ", n3 = " + n3 + ", n4 = " + n4);
}

var bar = function (n1) {
    return n1;
};

// demonstrates argument reordering and pass-by-reference
var ref = {val: 7};
// (_1 and _2 are represent future arguments that will be passed to f1)
var f1 = placeholders.bind(foo1, placeholders._2, placeholders._1, 42, ref);
ref.val = 10;
f1(1, 2, 1001); // 1 is bound by _1, 2 is bound by _2, 1001 is unused
				// makes a call to foo1(2, 1, 42, ref)

// nested bind subexpressions share the placeholders
var f2 = placeholders.bind(foo2, placeholders._3, placeholders.bind(bar, placeholders._3), placeholders._3, 4, 5);
f2(10, 11, 12);

// example 2:

var RandomEngine = function () {};

RandomEngine.toInt = function (n) {
	return parseInt(n, 10);
};

RandomEngine.prototype.get = function (min, max) {
	min = RandomEngine.toInt(min) || 0; 
	max = RandomEngine.toInt(max) || 1;
	return Math.random() * (max - min) + min;
};

RandomEngine.prototype.getInt = function (min, max) {
	min = RandomEngine.toInt(min) || 0; 
	max = RandomEngine.toInt(max) || 1;
	return Math.floor(Math.random() * (max - min)) + min;
};

RandomEngine.prototype.getInRange = function (min, max) {
	min = RandomEngine.toInt(min) || 0; 
	max = RandomEngine.toInt(max) || 1;
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

var StringGenerator = function (randomEngine) {
	var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	
	this.get = function (length) {
		var result = '';
		for (var i = length; i > 0; --i) result += chars[randomEngine.getInt(0, chars.length)];
		return result;
	};	
};

var randomEngine = new RandomEngine();
var randomString = placeholders.bind(
	(new StringGenerator(randomEngine)).get, 
	placeholders.bind(randomEngine.getInRange, 1, 10)
);

console.log(randomString()); // pm9OOQYR9
console.log(randomString()); // zh3
console.log(randomString()); // ex5KKp
console.log(randomString()); // lKkfV1Tl
console.log(randomString()); // 53ZoB

// example 3:

var SomeClass = function (arg1, arg2, arg3) {
	this.params = [].slice.call(arguments);
};

SomeClass.prototype.getParams = function () {
	return this.params;
};

SomeClass = placeholders.bind(SomeClass, 3, placeholders.bind(bar, placeholders._2), placeholders._1);
var someClassObj = new SomeClass(1, 2);
console.log(someClassObj instanceof SomeClass);// true
console.log(someClassObj.getParams());// [3, 2, 1]

// example 4:

var MyApp = function (version) {
	this.version = '0.0.0';
	this.logs = [];
	this.setVersion(version);
};

MyApp.prototype.setVersion = function (version) {
	this.version = /^\d+\.\d+\.\d+$/.test(version) ? version : this.version;
};

MyApp.prototype.getVersion = function () {
	return this.version;
};

MyApp.prototype.init = function () {
	console.log('Application (version: ' + this.version + ') is initialized');
};
 
var FunctorFactory = function (classObject, functorBody) {	
	if (typeof functorBody === 'undefined') {
		throw new Error("Body functor is undefined");
	}
	
	var object = typeof classObject == 'function' 
				 ? new classObject()
				 : classObject;
				 
	//
	functorBody = functorBody in object
				  ? object[functorBody]
				  : functorBody;
	
	functorBody = typeof functorBody == 'function'
				  ? functorBody
				  : function () {};
	
	var functor = placeholders.context(functorBody, object);
	
	// including prototype and excepting open fields
	for (var key in object) {
		if (typeof object[key] == 'function') {
			functor[key] = placeholders.context(object[key], object);
		}
	}
	
	return functor;
};

var myApp = new MyApp();
var myAppFunctor1 = FunctorFactory(myApp, myApp.init);
myAppFunctor1.setVersion('1.2.3');
myAppFunctor1(); // Application (version: 1.2.3) is initialized

var myAppFunctor2 = FunctorFactory(placeholders.bind(MyApp, '3.2.1'), 'init');
myAppFunctor2(); // Application (version: 3.2.1) is initialized
