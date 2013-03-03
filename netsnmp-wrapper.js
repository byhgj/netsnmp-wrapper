spawn = require('child_process').spawn;

exports=module.exports={
	options:{
		snmpget:'c:\\usr\\bin\\snmpget.exe',
		snmpwalk:'c:\\usr\\bin\\snmpwalk.exe',
		snmpset:'c:\\usr\bin\\snmpset.exe',
		version:'v2c'
	},
	set:function(target,community,oid,oidtype,value,feedCb){
		var ls = spawn(this.options.snmpset,['-'+this.options.version,'-On', '-c',community,target,oid,oidtype,value]);
	},
	get:function(target,community,oid,feedCb){
		var ls = spawn(this.options.snmpget,['-'+this.options.version,'-On', '-c',community,target,oid]);
		var buf=[];

		ls.stdout.on('data', function (data) {
			buf.push(data);
		});
		ls.stderr.on('data', function (data) {
			console.log(data.toString());
		});
		ls.on('exit', function (code) {
			var data=buf.toString();
			if (data.trim() != ''){
				var re=/^\.([\d.]+) = ([\S+]+): ([\S\s+]+)/i;
				var arr = re.exec(data.trim());
				if (typeof feedCb == 'function') {
					feedCb({oid:arr[1],type:arr[2],value:arr[3]});
				}
			}
		});
	},
	walk:function(target,community,oid,feedCb){
		var ls = spawn(this.options.snmpwalk,['-'+this.options.version,'-On','-Cc', '-c',community,target,oid]);

		var buf=[];

		ls.stdout.on('data', function (data) {
			buf.push(data);
		});
		ls.stderr.on('data', function (data) {
			console.log(data.toString());
		});
		ls.on('exit', function (code) {
			var rows = buf.join('').split('\r\n');
			var o = [];
			rows.forEach(function(data){
				if (data.trim() != ''){
					var re=/^\.([\d.]+) = ([\S+]+): ([\S\s+]+)/i;
					//var re=/^\.([\d.]+)[\s]+=[\s]+([\S+]+):[\s]+([\S+]+)$/i;
					var arr = re.exec(data.trim());
					o.push({oid:arr[1],type:arr[2],value:arr[3]});
				}
			});
			if (typeof feedCb == 'function') {
				feedCb(o);
			}
		});
	}
}