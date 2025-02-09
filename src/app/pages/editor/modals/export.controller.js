(function () {
    'use strict';

    angular
        .module('app')
        .controller('ExportController', ExportController);

    ExportController.$inject = [
        '$scope',
        '$document',
        '$window',
        '$stateParams',
        'dialogService',
        'notificationService',
        'storageService',
        '$window'
    ];

    function ExportController($scope,
        $document,
        $window,
        $stateParams,
        dialogService,
        notificationService,
        storageService,
        window) {
        var vm = this;
        vm.type = null;
        vm.format = null;
        vm.compact = '';
        vm.pretty = '';
        vm.result = null;
        vm.data = null;
        vm.hideCompact = false;
        vm.showCompact = showCompact;
        vm.showPretty = showPretty;
        vm.select = select;
        vm.save = save;
        vm.saveJson = saveJson;

        _active();

        function _active() {
            vm.type = $stateParams.type;
            vm.format = $stateParams.format;

            var e = $window.editor.export;

            if (vm.type === 'project' && vm.format === 'json') {
                _createJson(e.projectToData());
            } else if (vm.type === 'tree' && vm.format === 'json') {
                _createJson(e.treeToData());
            } else if (vm.type === 'nodes' && vm.format === 'json') {
                _createJson(e.nodesToData());
            }
        }

        function _createJson(data) {
            vm.data = data;
            vm.compact = JSON.stringify(data);
            vm.pretty = JSON.stringify(data, null, 2);
            vm.result = vm.pretty;
        }

        function select() {
            var range = $document[0].createRange();
            range.selectNodeContents($document[0].getElementById('export-result'));
            var sel = $window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        }

        function save() {
            dialogService
                .saveAs(null, ['.b3', '.json'])
                .then(function (path) {
                    storageService
                        .saveAsync(path, vm.pretty)
                        .then(function () {
                            notificationService.success(
                                'File saved',
                                'The file has been saved successfully.'
                            );
                        });
                });
        }

        function saveJson() {
            var blob = new Blob([vm.result], { type: 'application/json' });
            var downloadLink = $window.document.createElement('a');
            downloadLink.href = $window.URL.createObjectURL(blob);
            downloadLink.download = 'archivo.json';

            $window.document.body.appendChild(downloadLink);
            downloadLink.click();

            $window.document.body.removeChild(downloadLink);
        }

        function showCompact() {
            vm.result = vm.compact;
        }

        function showPretty() {
            vm.result = vm.pretty;
        }
    }

})();