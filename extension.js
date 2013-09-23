const Lang = imports.lang;
const St = imports.gi.St;
const Main = imports.ui.main;
const Tweener = imports.ui.tweener;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const GLib = imports.gi.GLib;
const Gtk = imports.gi.Gtk;
const Gdk = imports.gi.Gdk;
const Gio = imports.gi.Gio;

const U1Indicator = new Lang.Class({
    Name: 'U1Indicator',

    Extends: PanelMenu.Button,

    _onGotoU1WebsiteActivated: function() {
	Gtk.show_uri(null, "https://one.ubuntu.com/", Gdk.CURRENT_TIME);
    },

    _onOpenU1FolderActivated: function() {
	Gtk.show_uri(null, ["file://", GLib.get_home_dir(), "/Ubuntu One"].join(""), Gdk.CURRENT_TIME);
    },

    _onOpenU1Activated: function() {
	GLib.spawn_command_line_async("ubuntuone-control-panel-qt");
    },

    _onShareFileActivated: function() {
	GLib.spawn_command_line_async("ubuntuone-control-panel-qt --switch-to share_links");
    },

    _updateFreeSpace: function() {
	const U1Iface = <interface name="com.ubuntuone.SyncDaemon.Status">
	    <method name="free_space">
	    <arg direction="in" name="vol_id" type="s" />
	    <arg direction="out" type="t" />
	    </method>
	    </interface>

	const U1Proxy = Gio.DBusProxy.makeProxyWrapper(U1Iface);
	var gdbusProxy = new U1Proxy(Gio.DBus.session, 'com.ubuntuone.SyncDaemon', '/status');
	gdbusProxy.free_spaceRemote("", 
				    Lang.bind(this, function(result, error) {
					let free_space_GB = result / 1073741824;
					this._free_space_label.set_text(free_space_GB.toPrecision(3) + "G");
				    }));

    },

    _onGetFreeSpace: function() {

	const U1Iface = <interface name="com.ubuntuone.SyncDaemon.Status">
	    <method name="free_space">
	    <arg direction="in" name="vol_id" type="s" />
	    <arg direction="out" type="t" />
	    </method>
	    </interface>

	const U1Proxy = Gio.DBusProxy.makeProxyWrapper(U1Iface);
	var gdbusProxy = new U1Proxy(Gio.DBus.session, 'com.ubuntuone.SyncDaemon', '/status');
	gdbusProxy.free_spaceRemote("", function(result, error){a=result;});
    },

    _init: function() {
	this.parent(St.Align.START);
	this.label = new St.Label({ text: "U1"});
	this.actor.add_actor(this.label);

	this._syncToggle = new PopupMenu.PopupSwitchMenuItem("Syncing", false, {style_class: 'popup-subtitle-menu-item'});
	this.menu.addMenuItem(this._syncToggle);

	this._openU1 = new PopupMenu.PopupMenuItem('Open U1', { reactive: true });
	this._openU1.connect('activate', Lang.bind(this, this._onOpenU1Activated));
        this.menu.addMenuItem(this._openU1);

	this._openU1Folder = new PopupMenu.PopupMenuItem('Open U1 Folder', { reactive: true });
	this._openU1Folder.connect('activate', Lang.bind(this, this._onOpenU1FolderActivated));
        this.menu.addMenuItem(this._openU1Folder);                  

	this._sharefile = new PopupMenu.PopupMenuItem('Share a file', { reactive: true });
	this._sharefile.connect('activate', Lang.bind(this, this._onShareFileActivated));
        this.menu.addMenuItem(this._sharefile);

	this._gotoU1Website = new PopupMenu.PopupMenuItem('Goto U1 Website', { reactive: true });
	this._gotoU1Website.connect('activate', Lang.bind(this, this._onGotoU1WebsiteActivated));
        this.menu.addMenuItem(this._gotoU1Website);

	let free_space = new PopupMenu.PopupMenuItem('', {reactive: false});
	this._free_space_label = free_space.label;
	this.menu.addMenuItem(free_space);

	this._updateFreeSpace();
    }
});

let indicator;

function init() {
    indicator = new U1Indicator();
    Main.panel.addToStatusArea('u1indicator', indicator)
}

function enable() {
}

function disable() {
}
