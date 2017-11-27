// UI components

var searchServer = "https://proxy-xzapi.rhcloud.com/gsapi";

var infoPanel = {
	panel: $("#info-panel"),
	hide: function () {
		ip=$("#info-panel");
		ip.empty();
		ip.removeClass('alert alert-success alert-info alert-warning alert-danger');
	},
	showLoading: function () {
		ip = this.panel;
		this.hide();
		ip.addClass('alert alert-info');
		ip.append($('<img src="images/loading.gif"/>'));
		ip.append($('<span>  Searching......</span>'));
		ip.alert();
	},
	showInfo: function (text) {
		ip = this.panel;
		this.hide();
		ip.addClass('alert alert-info');
		ip.append('<span>'+text+'</span>');
		ip.alert();
	},
	showError: function (text) {
		ip = this.panel;
		this.hide();
		ip.addClass('alert alert-danger alert-dismissible');
		ip.append('<span>'+text+'</span>');
		ip.alert();
	}
};

var searchTask = {
	q: "",
	start: "",
	set_keyword: function (q) {this.q = encodeURIComponent(q.replace(' ', '+'));},
	start_search: function (s) {
		s = ((s==undefined)?0:s);
		this.start = s;
		$.ajax(searchServer, {
			data: {'q': this.q, 'start': this.start}, 
			method: 'POST',
			success: this.search_success, 
			error: this.search_error,
			timeout: 5e3
		});
	},
	search_success: function (data, textStatus, jqXHR) {
		obj = JSON.parse(data);
		if (parseInt(obj['ret']) !== 0) {
			infoPanel.showError("Search error occurred...");
		} else {
			searchUI.build_result(obj, searchTask.start);
			infoPanel.hide();
		}
	},
	search_error: function (data, textStatus, jqXHR) {
		infoPanel.showError("Search request timeout. Maybe our server is encountering restarting. Retry 1-2 times and things will get better.");
	}
};

var searchUI = {
	sres: $(".searchresult"),
	spg: $(".pagination"),
	sbtn: $("#searchbutton"),
	sipt: $("#searchkeyword"),
	init: function () {
		this.clear();
		this.sbtn.click(searchUI.search_click);
		this.sipt.keypress(function (e){
			if ( e.which == 13 ) {
			     e.preventDefault();
			     searchUI.search_click(e);
			}
		});
	},
	clear: function () {this.sres.empty(); this.spg.empty();},
	search_click: function (e) {
		q = $("#searchkeyword").val();
		$(window).scrollTop(0);
		infoPanel.showLoading();
		searchTask.set_keyword(q);
		searchTask.start_search(0);
	},
	page_click: function (e) {
		tpn = $(e.currentTarget).attr('data-pn');
		infoPanel.showLoading();
		searchTask.start_search(tpn);
	},
	build_result: function (obj, start) {
		this._build_pagination(obj['total'], start);
		this._build_search_result(obj['search_data']);
	}, 
	_build_search_result: function (search_data) {
		this.sres.empty();
		for (i in search_data) {
			s = search_data[i];
			en = $('<a class="list-group-item searchentry" target="_blank" href="'+s['url']+'"></a>');
			en.append('<h4 class="title">'+s['title']+'</h4>');
			en.append('<p class="text-success">'+s['url']+'</p>');
			en.append('<blockquote>'+s['summary']+'</blockquote>');
			this.sres.append(en);
		}
	}, 
	_build_pagination: function (total, start) {
		n = this.spg;
		n.empty();
		cpn = (start==undefined)?0:parseInt(start);
		tp = (total>100)?10:Math.ceil(total/10);
		for (var i=0; i < tp; i++) {
			n.append($('<li data-pn="'+(i*10)+'"><a href="#">'+(i+1)+'</a></li>'));
		}
		$('li[data-pn="'+cpn+'"]').addClass('active');
		$('li[data-pn!="'+cpn+'"]').click(this.page_click);
	}
};

var searchBoxMain = {
	sb: $("#searchbox-main"),
	init: function () {
		searchUI.spg.hide();
		$("#searchbutton-main").click(this.sbtn_click);
		$("#searchkeyword-main").keypress(function (e) {
			if ( e.which == 13 ) {
			     e.preventDefault();
			     searchBoxMain.sbtn_click(e);
			}
		});
	},
	sbtn_click: function (e) {
		searchUI.sipt.val($("#searchkeyword-main").val());
		searchUI.sbtn.trigger('click');
		searchBoxMain.sb.hide();
		searchUI.spg.show();
	}
};

searchUI.init();
searchBoxMain.init();