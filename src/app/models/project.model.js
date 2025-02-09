(function () {
    'use strict';

    angular
        .module('app')
        .factory('projectModel', projectModel);

    projectModel.$inject = [
        '$q',
        '$rootScope',
        '$window',
        'storageService',
        'systemService',
        'localStorageService',
        'editorService'
    ];

    function projectModel($q,
        $rootScope,
        $window,
        storageService,
        systemService,
        localStorageService,
        editorService) {

        // HEAD //
        var recentPath = systemService.join(systemService.getDataPath(), 'recents.json');
        var recentCache = null;
        var currentProject = null;

        var service = {
            getRecentProjects: getRecentProjects,
            newProject: newProject,
            getProject: getProject,
            saveProject: saveProject,
            openProject: openProject,
            openProjectId: openProjectId,
            closeProject: closeProject,
            removeProject: removeProject,
            getConditionsEvaluationMethod: getConditionsEvaluationMethod,
            getConditionsEvaluationEXP: getConditionsEvaluationEXP,
            getModelsRootPublic: getModelsRootPublic,
            getModelsRootPrivate: getModelsRootPrivate,
            PostModelId: PostModelId,
            getExplainers: getExplainers,
            getExplainersSubstitute: getExplainersSubstitute,
            getQueryImgTab: getQueryImgTab,
            PostExplainerLibraries: PostExplainerLibraries,
            runBT: runBT,
            RunNew: RunNew,
            GetSimNL: GetSimNL,
            GetDesciptionExplainer: GetDesciptionExplainer,
            UpdateJsonQuey: UpdateJsonQuey,
            GetInstanceModelSelect
        };
        return service;

        // BODY //
        function _saveRecentProjects() {
            storageService.save(recentPath, recentCache);
        }

        function RunNew(Json, ExplainerSelect) {
            return $q(function (resolve, reject) {
                try {
                    var data = storageService.PostExplainerNew(Json, ExplainerSelect);
                    resolve(data);
                } catch (e) {
                    reject(e);
                }
            });

        }

        function _updateRecentProjects(project) {
            if (project) {
                for (var i = recentCache.length - 1; i >= 0; i--) {
                    if (recentCache[i].path === project.path) {
                        recentCache.splice(i, 1);
                    } else {
                        recentCache[i].isOpen = false;
                    }
                }
                var data = {
                    name: project.name,
                    description: project.description,
                    path: project.path,
                    isOpen: true,
                    id: project.id
                };
                recentCache.splice(0, 0, data);
            } else {
                for (var j = 0; j < recentCache.length; j++) {
                    recentCache[j].isOpen = false;
                }
            }
            _saveRecentProjects();
        }

        function _setProject(project) {
            // Set current open project to the localStorage, so the app can open it
            //   during intialization
            currentProject = project;

            _updateRecentProjects(project);
            $rootScope.$broadcast('dash-projectchanged');
        }

        function getRecentProjects() {
            return $q(function (resolve, reject) {
                if (!recentCache) {
                    var data;
                    try {
                        data = storageService.load(recentPath);
                    } catch (e) { }

                    if (!data) {
                        data = [];
                    }

                    recentCache = data;
                }
                resolve(recentCache);
            });
        }

        function newProject(path, name) {
            return $q(function (resolve, reject) {
                var project = {
                    name: name,
                    description: '',
                    data: [],
                    path: path,
                    id: ''
                };

                editorService.newProject();
                project.data = editorService.exportProject();
                saveProject(project)
                    .then(function () {
                        _setProject(project);
                        resolve();
                    });
            });
        }

        function getProject() {
            return currentProject;
        }

        function saveProject(project) {
            project = project || currentProject;
            project.data = editorService.exportProject();
            // view project
            return $q(function (resolve, reject) {
                $window.editor.clearDirty();
                //save 
                var data = storageService.saveJson(project.path, project);
                storageService.save(project.path, project);
                _setProject(project);
                _updateRecentProjects(project);
                resolve(data);
            });
        }

        async function UpdateJsonQuey(QueryText, Img64) {
            return $q(function (resolve, reject) {
                try {
                    $window.editor.clearDirty();
                    var respuesta = storageService.UpdateJsonQueyStorage(currentProject.path, QueryText, Img64);
                    _setProject(currentProject);
                    _updateRecentProjects(currentProject);
                    resolve(respuesta);
                } catch (e) {
                    reject(e);
                }
            });
        }


        function openProject(path) {
            return $q(function (resolve, reject) {
                try {
                    var project = storageService.load(path);
                    editorService.openProject(project.data);
                    _setProject(project);
                    resolve();
                } catch (e) {
                    reject(e);
                }
            });
        }

        function openProjectId(id) {
            return $q(function (resolve, reject) {
                try {
                    storageService
                        .loadProjectId(id)
                        .then(function (json) {
                            editorService.openProject(json.data);
                            _setProject(json);
                            resolve(json);
                        });
                } catch (e) {
                    reject(e);
                }
            });
        }

        function closeProject() {
            return $q(function (resolve, reject) {
                $window.editor.clearDirty();
                editorService.closeProject();
                _setProject(null);
                resolve();
            });
        }

        function removeProject(path) {
            return $q(function (resolve, reject) {
                for (var i = 0; i < recentCache.length; i++) {
                    if (recentCache[i].path === path) {
                        recentCache.splice(i, 1);
                        break;
                    }
                }

                _saveRecentProjects();
                resolve();
            });
        }

        function getConditionsEvaluationMethod() {
            return $q(function (resolve, reject) {
                try {
                    //var data = storageService.loadEvaluation();
                    //resolve(data);
                    return {};
                } catch (e) {

                    reject(e);
                }
            });
        }

        async function getConditionsEvaluationEXP(x, IdModel) {
            return $q(function (resolve, reject) {
                try {
                    var data = storageService.loadExplanationExp(x, IdModel);
                    resolve(data);
                } catch (e) {
                    reject(e);
                }
            });
            
        }

        function getExplainers() {
            return $q(function (resolve, reject) {
                try {
                    var data = storageService.loadExplainers();
                    resolve(data);
                } catch (e) {
                    reject(e);
                }
            });
        }

        async function GetDesciptionExplainer(explainerTitle) {
            return $q(function (resolve, reject) {
                try {
                    var data = storageService.GetDesciptionExplainerStorage(explainerTitle);
                    resolve(data);
                } catch (e) {
                    reject(e);
                }
            });
        }

        async function getExplainersSubstitute() {
            return $q(function (resolve, reject) {
                try {
                    var data = storageService.loadExplainersSubstitute();
                    resolve(data);
                } catch (e) {
                    reject(e);
                }
            });
        }

        async function GetSimNL(SubNameChange) {

            return $q(function (resolve, reject) {
                try {
                    var data = storageService.GetSimNLStorage(SubNameChange);
                    resolve(data);
                } catch (e) {
                    reject(e);
                }
            });
        }

        function getModelsRootPrivate(idModelUrl) {
            return $q(function (resolve, reject) {
                try {
                    const promise = Promise.resolve(storageService.loadModelsPrivate(idModelUrl));
                    promise
                        .then((value) => {
                            resolve(value);
                        })
                        .catch((err) => {
                            console.log(err);
                        });

                } catch (e) {
                    reject(e);
                }
            });
        }

        function getModelsRootPublic() {
            return $q(function (resolve, reject) {
                try {
                    const promise = Promise.resolve(storageService.loadModelsPublic());
                    promise
                        .then((value) => {
                            resolve(value);
                        })
                        .catch((err) => {
                            console.log(err);
                        });

                } catch (e) {
                    reject(e);
                }
            });
        }

        function PostModelId(ModelId, Quey, Image) {
            return $q(function (resolve, reject) {
                try {
                    var data = storageService.PostModelIdLoadModel(ModelId, Quey, Image);
                    resolve(data);
                } catch (e) {
                    reject(e);
                }
            });
        }

        function GetInstanceModelSelect(ModelId) {
            return $q(function (resolve, reject) {
                try {
                    var data = storageService.GetInstanceModelSelectStorage(ModelId);
                    resolve(data);
                } catch (e) {
                    reject(e);
                }
            });
        }


        function getQueryImgTab(IdModel, Quey_id, imagefile) {
            return $q(function (resolve, reject) {
                try {
                    var data = storageService.GetQuery(IdModel, Quey_id, imagefile);
                    resolve(data);
                } catch (e) {
                    reject(e);
                }
            });
        }

        function PostExplainerLibraries(Model, Params, Instance) {
            return $q(function (resolve, reject) {
                try {
                    var data = storageService.PostExplainers(Model, Params, Instance);
                    resolve(data);
                } catch (e) {
                    reject(e);
                }
            });
        }

        function runBT(project) {
            project = project || currentProject;
            project.data = editorService.exportProject();

            return project.data.trees[0];;
        }



    }
})();