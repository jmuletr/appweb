(function(factory) {
    if (typeof define === 'function' && define.amd) {
        define([ 'jquery' ], factory);
    } else {
        factory(jQuery);
    }
})
(function($) {


    var fc = $.fullCalendar;
    var applyAll = fc.applyAll;

    fc.sourceNormalizers.push(function(sourceOptions) {
        if (sourceOptions.dataType == 'gcalv3'
        || (sourceOptions.dataType === undefined
            && (sourceOptions.url || '').match(/^(http|https):\/\/www.googleapis.com\/calendar\/v3\/calendars\//))) {
                sourceOptions.dataType = 'gcalv3';
                if (sourceOptions.editable === undefined) {
                    sourceOptions.editable = false;
            }
        }
    });

    fc.sourceFetchers.push(function(sourceOptions, start, end, timezone) {
        if (sourceOptions.dataType == 'gcalv3') {
            return transformOptionsV3(sourceOptions, start, end, timezone);
        }
    });

    function transformOptionsV3(sourceOptions, start, end, timezone) {

        var success = sourceOptions.success;
        var data = $.extend({}, sourceOptions.data || {}, {
            singleevents: true,
            'max-results': 9999
        });

        return $.extend({}, sourceOptions, {
            url: sourceOptions.url,
            dataType: 'json',
            data: data,
            startParam: 'start-min',
            endParam: 'start-max',
            success: function(data) {
                var events = [];
                if (data.items) {
                    $.each(data.items, function(i, entry) {
                        events.push({
                            id: entry.id,
                            title: entry.summary || '', // must allow default to blank, if it's not set it doesn't exist in the json and will error here
                            start: entry.start.dateTime || entry.start.date,
                            end: entry.end.dateTime || entry.start.date,  // because end.date may be the next day, cause a '2-all-day' event, we use start.date here.
                            url: entry.htmlLink,
                            location: entry.location || '', // must allow default to blank, if it's not set it doesn't exist in the json and will error here
                            description: entry.description || '' // must allow default to blank, if it's not set it doesn't exist in the json and will error here
                        });

                    });
                }
                var args = [events].concat(Array.prototype.slice.call(arguments, 1));
                var res = applyAll(success, this, args);
                if ($.isArray(res)) {
                    return res;
                }
                return events;
            }
        });

    }
});
