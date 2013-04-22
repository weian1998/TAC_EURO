/*
*   Customization of DhtmlxScheduler core functions for Saleslogix Activity Scheduler
*   
**/
(function () {

    scheduler.config.multi_day = true;
    scheduler.config.xml_date = "%m/%d/%y %H:%i";
    scheduler.config.hour_date = "%g:%i %A",
    scheduler.config.start_on_monday = 1;
    scheduler.config.default_date = "%F %d, %Y";

    

    /**
    * Function : Custom date format 
    * Views : Week and work week
    */
    scheduler.templates.week_scale_date = function (d) {
        var weekFormat1 = scheduler.date.date_to_str("%d");
        var weekFormat2 = scheduler.date.date_to_str("%l");
        return "<div style='float:left;padding-left:5px;'>" + weekFormat1(d) + "</div><div style='display:inline;'>" + weekFormat2(d) + "</div>";
    };


    /** 
    * Function : Enabling double click on blocked time area on day view
    * Views : Day
    * (referenced from scheduler._on_dbl_click --> switch --> default case)
    */
    scheduler.dblclick_dhx_time_block_custom = function (e) {
        if (!scheduler.config.dblclick_create) return;
        var pos = this._mouse_coords(e);
        var start = this._min_date.valueOf() + (pos.y * this.config.time_step + (this._table_view ? 0 : pos.x) * 24 * 60) * 60000;
        start = this._correct_shift(start);
        this.addEventNow(start, null, e);
    };

    scheduler.templates.workweek_date = function (d1, d2) {
        var weekHeaderFormat = scheduler.date.date_to_str("%d");
        return weekHeaderFormat(d1) + " &ndash; " + scheduler.templates.day_date(d2);
    };
    /**
    * Function : hightlight only the working hours (useroptions - daystartTime and dayendTime)  
    * Views : Day, Week and work week
    */
    scheduler.attachEvent("onScaleAdd", function (b, a) {
        var c = scheduler.config.workHours; // k[a.valueOf()] || ll[a.getDay()];
        if (c) for (var d = 0; d < c.length; d += 2) {
            var e = c[d],
                f = c[d + 1],
                h = document.createElement("DIV");
            h.className = "dhx_time_block_custom";
            var j;
            h.style.top = Math.round((e * 6E4 - this.config.first_hour * 36E5) * this.config.hour_size_px / 36E5) % (this.config.hour_size_px * 24) + "px";
            h.style.height = Math.round((f - e - 1) * 6E4 * this.config.hour_size_px / 36E5) % (this.config.hour_size_px * 24) + "px";
            b.appendChild(h)
        }
    });

    /**
    * Function : Highlight current day - only the header of the cell
    * Views : Month                
    */
    scheduler.templates.month_date_class = function (date, today) {
        if (date.getDate() == today.getDate())
            return "slx_calendar_today";
        return "";
    };
    /**
    * Function : Event bar -  change color based on selected users
    * Views : All
    */
    scheduler.templates.event_class = function (start, end, event) {
        var eventUserColor = "";
        if (event.userColor)
            eventUserColor = event.userColor;

        var mode = scheduler.getState().mode;
        if (mode !== "month" && event.type !== "event") {
            return "event_day_" + eventUserColor;
        }
        else {
            if (!event.confirmed)
                return "event_" + eventUserColor + " pending";
            else
                return "event_" + eventUserColor;
        }
    };

    /**
    * Function : Customization for work week view rendering
    * Views : work week
    */
    scheduler._mouse_coords = function (ev) {
        var pos;
        var b = document.body;
        var d = document.documentElement;
        if (ev.pageX || ev.pageY)
            pos = { x: ev.pageX, y: ev.pageY };
        else
            pos = {
                x: ev.clientX + (b.scrollLeft || d.scrollLeft || 0) - b.clientLeft,
                y: ev.clientY + (b.scrollTop || d.scrollTop || 0) - b.clientTop
            };

        //apply layout
        pos.x -= getAbsoluteLeft(this._obj) + (this._table_view ? 0 : this.xy.scale_width);
        pos.y -= getAbsoluteTop(this._obj) + this.xy.nav_height + (this._dy_shift || 0) + this.xy.scale_height - this._els["dhx_cal_data"][0].scrollTop;
        pos.ev = ev;

        var handler = this["mouse_" + this._mode];
        if (handler)
            return handler.call(this, pos);

        //transform to date
        if (!this._table_view) {
            // pos.x = Math.max(0, Math.ceil(pos.x / this._cols[0]) - 1);
            //Commented the above and added the following to customize for work week view rendering
            //Updated the logic to consider the skipped dates on workweek view
            var summ = 0;
            var posX = pos.x;
            pos.x = 0;
            for (var i = 0; i < this._cols.length; i++) {
                summ += this._cols[i];
                if (summ >= posX) {
                    pos.x = i;
                    break;
                }
            }
            pos.y = Math.max(0, Math.ceil(pos.y * 60 / (this.config.time_step * this.config.hour_size_px)) - 1) + this.config.first_hour * (60 / this.config.time_step);
        } else {
            var dy = 0;
            for (dy = 1; dy < this._colsS.heights.length; dy++)
                if (this._colsS.heights[dy] > pos.y) break;

            pos.y = (Math.max(0, Math.ceil(pos.x / this._cols[0]) - 1) + Math.max(0, dy - 1) * 7) * 24 * 60 / this.config.time_step;
            pos.x = 0;
        }

        return pos;
    };



    scheduler._render_v_bar = function (id, x, y, w, h, style, contentA, contentB, bottom) {
        var d = document.createElement("DIV");
        var ev = this.getEvent(id);
        var cs = "dhx_cal_event";
        var cse = scheduler.templates.event_class(ev.start_date, ev.end_date, ev);
        if (cse) cs = cs + " " + cse;

        var titleCs = "dhx_title";
        var titleCse = scheduler.templates.event_title_class(ev.start_date, ev.end_date, ev);
        if (titleCse) titleCs = titleCs + " " + titleCse;

        var bg_color = (ev.color ? ("background-color:" + ev.color + ";") : "");
        var color = (ev.textColor ? ("color:" + ev.textColor + ";") : "");

        var html = '<div event_id="' + id + '" class="' + cs + '" style="position:absolute; top:' + y + 'px; left:' + x + 'px; width:' + (w - 4) + 'px; height:' + h + 'px;' + (style || "") + '">';
        html += '<div class="dhx_header" style=" width:' + (w - 6) + 'px;' + bg_color + '" >&nbsp;</div>';
        html += '<div class="' + titleCs + '" style="' + bg_color + '' + color + '">' + contentA + '</div>';
        html += '<div class="dhx_body" style=" width:' + (w - (this._quirks ? 4 : 14)) + 'px; height:' + (h - (this._quirks ? 20 : 30)) + 'px;' + bg_color + '' + color + '">' + contentB + '</div>';
        html += '<div class="dhx_footer" style=" width:' + (w - 8) + 'px;' + (bottom ? ' margin-top:-1px;' : '') + '' + bg_color + '' + color + '" ></div></div>';

        d.innerHTML = html;
        return d.firstChild;
    };


    scheduler._pre_render_events = function (evs, hold) {
        var hb = this.xy.bar_height;
        var h_old = this._colsS.heights;
        var h = this._colsS.heights = [0, 0, 0, 0, 0, 0, 0];
        var data = this._els["dhx_cal_data"][0];

        if (!this._table_view) evs = this._pre_render_events_line(evs, hold); //ignore long events for now
        else evs = this._pre_render_events_table(evs, hold);

        if (this._table_view) {
            if (hold)
                this._colsS.heights = h_old;
            else {
                var evl = data.firstChild;
                if (evl.rows) {
                    for (var i = 0; i < evl.rows.length; i++) {
                        h[i]++;
                        //****Commented the following to fix the column height from growing dynamically in month view
                        //					if ((h[i])*hb > this._colsS.height-22){ // 22 - height of cell's header
                        //						//we have overflow, update heights
                        //						var cells = evl.rows[i].cells;
                        //						for (var j=0; j < cells.length; j++) {
                        //							cells[j].childNodes[1].style.height = h[i]*hb+"px";
                        //						}
                        //						h[i]=(h[i-1]||0)+cells[0].offsetHeight;
                        //					}
                        h[i] = (h[i - 1] || 0) + evl.rows[i].cells[0].offsetHeight;
                    }
                    h.unshift(0);
                    if (evl.parentNode.offsetHeight < evl.parentNode.scrollHeight && !evl._h_fix) {
                        //we have v-scroll, decrease last day cell
                        for (var i = 0; i < evl.rows.length; i++) {
                            var cell = evl.rows[i].cells[6].childNodes[0];
                            var w = cell.offsetWidth - scheduler.xy.scroll_width + "px";
                            cell.style.width = w;
                            cell.nextSibling.style.width = w;
                        }
                        evl._h_fix = true;
                    }
                } else {
                    if (!evs.length && this._els["dhx_multi_day"][0].style.visibility == "visible")
                        h[0] = -1;
                    if (evs.length || h[0] == -1) {
                        //shift days to have space for multiday events
                        var childs = evl.parentNode.childNodes;
                        var eventsHeight;
                        if (scheduler.config.eventsMaxCount) {
                            eventsHeight = scheduler.config.eventsMaxCount - 1;
                            if (h[0] < eventsHeight)
                                eventsHeight = h[0];
                        } else {
                            eventsHeight = h[0];
                        }
                        var dh = ((eventsHeight + 1) * hb + 1) + "px";
                        //var dh = ((h[0] + 1) * hb + 1) + "px"; // +1 so multiday events would have 2px from top and 2px from bottom by default
                        data.style.top = (this._els["dhx_cal_navline"][0].offsetHeight + this._els["dhx_cal_header"][0].offsetHeight + parseInt(dh)) + 'px';
                        data.style.height = (this._obj.offsetHeight - parseInt(data.style.top) - (this.xy.margin_top || 0)) + 'px';
                        var last = this._els["dhx_multi_day"][0];
                        last.style.height = dh;
                        last.style.visibility = (h[0] == -1 ? "hidden" : "visible");
                        last = this._els["dhx_multi_day"][1];
                        last.style.height = dh;
                        last.style.visibility = (h[0] == -1 ? "hidden" : "visible");
                        last.className = h[0] ? "dhx_multi_day_icon" : "dhx_multi_day_icon_small";
                        this._dy_shift = (h[0] + 1) * hb;
                        h[0] = 0;
                    }
                }
            }
        }

        return evs;
    };

    /**
    * Function : Enabling drag drop creation of activity on outside working hrs in Day view
    * View : Day
    */

    scheduler._on_mouse_down = function (e, src) {
        if (this.config.readonly || this._drag_mode) return;
        src = src || (e.target || e.srcElement);
        if (e.button == 2 || e.ctrlKey) return this._on_mouse_context(e, src);
        switch (src.className.split(" ")[0]) {
            case "dhx_cal_event_line":
            case "dhx_cal_event_clear":
                if (this._table_view)
                    this._drag_mode = "move"; //item in table mode
                break;
            case "dhx_header":
            case "dhx_title":
            case "dhx_wa_ev_body":
                this._drag_mode = "move"; //item in table mode
                break;
            case "dhx_footer":
                this._drag_mode = "resize"; //item in table mode
                break;
            case "dhx_scale_holder":
            case "dhx_scale_holder_now":
            case "dhx_month_body":
            case "dhx_matrix_cell":
            case "dhx_time_block_custom":
                this._drag_mode = "create";
                break;
            case "":
                if (src.parentNode)
                    return scheduler._on_mouse_down(e, src.parentNode);
            default:
                this._drag_mode = null;
                this._drag_id = null;
        }
        if (this._drag_mode) {
            var id = this._locate_event(src);
            if (!this.config["drag_" + this._drag_mode] || !this.callEvent("onBeforeDrag", [id, this._drag_mode, e]))
                this._drag_mode = this._drag_id = 0;
            else {
                this._drag_id = id;
                this._drag_event = scheduler._lame_copy({}, this._copy_event(this.getEvent(this._drag_id) || {}));
            }
        }
        this._drag_start = null;
    };

    /**
    * Function : Customize rendering of columns for work week view to skip days
    * View : work week
    */
    scheduler._reset_scale = function () {
        //current mode doesn't support scales
        //we mustn't call reset_scale for such modes, so it just to be sure
        if (!this.templates[this._mode + "_date"]) return;

        var h = this._els["dhx_cal_header"][0];
        var b = this._els["dhx_cal_data"][0];
        var c = this.config;

        var workWeek = scheduler.config.workWeek;

        h.innerHTML = "";
        b.scrollTop = 0; //fix flickering in FF
        b.innerHTML = "";


        var str = ((c.readonly || (!c.drag_resize)) ? " dhx_resize_denied" : "") + ((c.readonly || (!c.drag_move)) ? " dhx_move_denied" : "");
        if (str) b.className = "dhx_cal_data" + str;


        this._cols = []; //store for data section
        this._colsS = { height: 0 };
        this._dy_shift = 0;

        this.set_sizes();
        var summ = parseInt(h.style.width); //border delta
        var left = 0;

        var d, dd, sd, today;
        dd = this.date[this._mode + "_start"](new Date(this._date.valueOf()));
        d = sd = this._table_view ? scheduler.date.week_start(dd) : dd;
        today = this.date.date_part(new Date());

        //reset date in header
        var ed = scheduler.date.add(dd, 1, this._mode);
        var count = 7;
        var dCount = 7;

        var count_n = this.date["get_" + this._mode + "_end"];
        if (count_n) ed = count_n(dd);

        if (this._mode == "workweek") {
            count = scheduler.config.workWeek.length;
            ed = scheduler.date.add(ed, 1, "day");
            dCount = 7;
        } else if (!this._table_view) {
            count = Math.round((ed.valueOf() - dd.valueOf()) / (1000 * 60 * 60 * 24));
            dCount = count;
        }
        this._min_date = d;
        this._els["dhx_cal_date"][0].innerHTML = this.templates[this._mode + "_date"](dd, ed, this._mode);
        var jj = 0;

        var daysCount = count;
        this._week_min_date = d;
        this._week_max_date = d;
        this._workweek_min_date = d;
        this._workweek_max_date = d;

        if (this._mode == "workweek") {
            daysCount = scheduler.config.workWeek[(scheduler.config.workWeek.length) - 1];
        }
       
        var findElement = function (arr,obj) {
            for (var x = 0; x < arr.length; x++) {
                if (arr[x] == obj) {
                    return x;
                }
            }
            return -1;
        };

        for (var i = 0; i < dCount; i++) {
            if (this._mode == "workweek") {
                if (findElement(scheduler.config.workWeek, d.getDay()) === -1) {
                    //if (dojo.indexOf(scheduler.config.workWeek, d.getDay()) === -1) {
                    //if (scheduler.config.workWeek.indexOf(d.getDay()) === -1) {
                    this._cols[i] = 0;
                } else {
                    this._cols[i] = Math.floor(summ / (count - jj));
                    if (jj == 0) {
                        this._workweek_min_date = d;
                    }
                    jj++;
                    this._workweek_max_date = d;
                }
            } else
                this._cols[i] = Math.floor(summ / (count - i));

            if (this._cols[i] > 0) {
                this._render_x_header(i, left, d, h);
                //Added to get the last day displayed on calendar on week and work week views
                this._week_max_date = d;
            }
            if (!this._table_view) {
                var scales = document.createElement("DIV");
                var cls = "dhx_scale_holder";
                if (d.valueOf() == today.valueOf()) cls = "dhx_scale_holder_now";
                scales.className = cls + " " + this.templates.week_date_class(d, today);
                this.set_xy(scales, this._cols[i] - 1, c.hour_size_px * (c.last_hour - c.first_hour), left + this.xy.scale_width + 1, 0); //-1 for border
                b.appendChild(scales);
                this.callEvent("onScaleAdd", [scales, d]);
            }

            d = this.date.add(d, 1, "day");
            summ -= this._cols[i];
            left += this._cols[i];
            this._colsS[i] = (this._cols[i - 1] || 0) + (this._colsS[i - 1] || (this._table_view ? 0 : this.xy.scale_width + 2));
            this._colsS['col_length'] = daysCount + 1;
        }
        if (this._mode == "workweek") {
            this._max_date = scheduler.date.add(this._workweek_max_date, 1, "day");
        } else {
            this._max_date = d;
        }
        this._colsS[daysCount] = this._cols[daysCount - 1] + this._colsS[daysCount - 1];

        if (this._table_view) // month view
            this._reset_month_scale(b, dd, sd);
        else {
            this._reset_hours_scale(b, dd, sd);
            if (c.multi_day) {
                var dhx_multi_day = 'dhx_multi_day';

                if (this._els[dhx_multi_day]) {
                    this._els[dhx_multi_day][0].parentNode.removeChild(this._els[dhx_multi_day][0]);
                    this._els[dhx_multi_day] = null;
                }

                var navline = this._els["dhx_cal_navline"][0];
                var top = navline.offsetHeight + this._els["dhx_cal_header"][0].offsetHeight + 1;

                var c1 = document.createElement("DIV");
                c1.className = dhx_multi_day;
                c1.style.visibility = "hidden";
                if (this._mode == "workweek") {
                    this.set_xy(c1, this._colsS[this._colsS.col_length] + this.xy.scroll_width, 0, 0, top); // 2 extra borders, dhx_header has -1 bottom margin
                } else {
                    this.set_xy(c1, this._colsS[this._colsS.col_length - 1] + this.xy.scroll_width, 0, 0, top); // 2 extra borders, dhx_header has -1 bottom margin
                }
                b.parentNode.insertBefore(c1, b);

                var c2 = c1.cloneNode(true);
                c2.className = dhx_multi_day + "_icon";
                c2.style.visibility = "hidden";
                this.set_xy(c2, this.xy.scale_width, 0, 0, top); // dhx_header has -1 bottom margin

                c1.appendChild(c2);
                this._els[dhx_multi_day] = [c1, c2];
                this._els[dhx_multi_day][0].onclick = this._click.dhx_cal_data;
            }

            if (this.config.mark_now) {
                var now = new Date();
                if (now < this._max_date && now > this._min_date && now.getHours() >= this.config.first_hour && now.getHours() < this.config.last_hour) {
                    var day = this.locate_holder_day(now);
                    var sm = now.getHours() * 60 + now.getMinutes();
                    var now_time = document.createElement("DIV");
                    now_time.className = "dhx_now_time";
                    now_time.style.top = (Math.round((sm * 60 * 1000 - this.config.first_hour * 60 * 60 * 1000) * this.config.hour_size_px / (60 * 60 * 1000))) % (this.config.hour_size_px * 24) + 1 + "px";
                    b.childNodes[day].appendChild(now_time);
                }
            }
        }
    };


    scheduler.addEvent = function (start_date, end_date, text, id, extra_data) {
        if (!arguments.length)
            return this.addEventNow();
        var ev = start_date;
        if (arguments.length != 1) {
            ev = extra_data || {};
            ev.start_date = start_date;
            ev.end_date = end_date;
            ev.text = text;
            ev.id = id;
        }
        ev.id = ev.id || scheduler.uid();
        ev.text = ev.text || "";

        if (typeof ev.start_date == "string") ev.start_date = this.templates.api_date(ev.start_date);
        if (typeof ev.end_date == "string") ev.end_date = this.templates.api_date(ev.end_date);

        //var d = (this.config.event_duration || this.config.time_step) * 60000;
        //Modified the step to 0 to support events with 0 mintues: defect Id :12086920
        var d = (this.config.event_duration || 0) * 60000;
        if (ev.start_date.valueOf() == ev.end_date.valueOf())
            ev.end_date.setTime(ev.end_date.valueOf() + d);

        ev._timed = this.is_one_day_event(ev);

        var is_new = !this._events[ev.id];
        this._events[ev.id] = ev;
        this.event_updated(ev);
        if (!this._loading)
            this.callEvent(is_new ? "onEventAdded" : "onEventChanged", [ev.id, ev]);
    };
})();