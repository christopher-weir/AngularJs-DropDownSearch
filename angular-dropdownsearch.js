'use strict';

angular.module('angular-dropdownsearch', [])
    .directive('ilnDropDownSearch', [
        '$document',
        '$rootScope',
        '$timeout',
        function( $document, $rootScope, $timeout ) {
            return {

                restrict    : 'E',

                scope: {
                    results: '=',
                    title: '=',
                    formval: '='
                },

                link: function(scope, element, attr){

                    var isActive            = false;
                    var currentSelected     = 0;

                    scope.title             = null;
                    scope.formval           = null;
                    scope.isPopupVisible    = false;
                    scope.activeclass       = 'disabled';
                    scope.searchText        = '';
                    scope.currentSelected   = null;




                    scope.$watch('results', function() {

                        if( scope.results ){
                            isActive = true;
                            scope.activeclass = '';
                        }else{
                            isActive = false;
                            scope.activeclass = 'disabled';
                        }

                    });


                    scope.hoverItem = function( _index ){
                        currentSelected = Number( _index + 1 );
                        scope.currentSelected = Number( _index );
                    };


                    scope.isActiveItem = function( _index ){
                        if( String( _index ) === String( scope.currentSelected ) ){
                            return 'result-list-item-active';
                        }
                        return '';
                    };


                    scope.selectItem = function( _next ){

                        scope.currentSelected = _next - 1;
                        scope.$apply();
                    };


                    scope.updateInput = function(){

                        var _current = angular.element( element[0].querySelector('.result-list-item-active') )[0];

                        scope.title = String(_current.attributes['data-dropdown-result'].value);
                        scope.formval = String(_current.attributes['data-dropdown-result-slug'].value);
                        scope.$apply();
                    };



                    // .focus();
                    scope.toggleSelect = function(){

                        if(!isActive){
                            return false;
                        }
                        currentSelected     = 0;
                        scope.currentSelected = null;
                        scope.isPopupVisible = !scope.isPopupVisible;

                        if( scope.isPopupVisible ){
                            $timeout(function() {
                                element.find( 'input' )[0].focus();
                            });
                        }
                    };

                    $document.bind('keydown', function( event ){
                        if( !isActive || !scope.isPopupVisible ){
                            return false;
                        }
                        var _max = 0;
                        if( element[0].querySelector('.result-list-item') ){
                            _max = angular.element( element[0].querySelector('.result-list-item') )[0].attributes['data-length'].value;
                        }


                        switch( event.which ) {

                            case 38: // up
                                event.preventDefault();
                                currentSelected--;

                                if( currentSelected <= 0 ){
                                    currentSelected = _max;
                                }
                                scope.selectItem( currentSelected );
                            break;

                            case 40: // down
                                event.preventDefault();
                                currentSelected++;

                                if( currentSelected > _max ){
                                    currentSelected = 1;
                                }
                                scope.selectItem( currentSelected );
                            break;

                            case 13: // enter
                                event.preventDefault();
                                scope.updateInput();

                                scope.$apply(function(){
                                    scope.isPopupVisible = false;
                                });
                            break;

                            default: return; // exit this handler for other keys
                        }
                    });

                    $document.bind('click', function( event ){

                        if(!isActive){
                            return false;
                        }

                        var isClickedElementChildOfPopup = element[0].contains(event.target);

                        if (isClickedElementChildOfPopup){



                            if( event.target.attributes['data-dropdown-result'] ){
                                scope.$apply(function(){
                                    scope.title = String( event.target.attributes['data-dropdown-result'].value );
                                    scope.formval = String( event.target.attributes['data-dropdown-result-slug'].value );
                                    scope.isPopupVisible = false;
                                });
                            }

                            return;
                        }

                        scope.$apply(function(){
                            scope.isPopupVisible = false;
                        });
                    });
                },

                template:   '<div class="search-dropdown-result" ng-click="toggleSelect()" ng-class="activeclass">'+
                                '<p>{{ title }} <span class="pull-right">&#9660;</span></p>' +
                            '</div>' +
                            '<div class="search-dropdown-wrap" ng-show="isPopupVisible">' +
                                '<div class="input-wrap">' +
                                    '<input type="text" ng-model="searchText"/>' +
                                '</div>' +
                                '<ul class="result-list">' +
                                    '<li ng-repeat="result in resultList = ( results | filter:searchText )"' +
                                        'class="result-list-item"' +
                                        'ng-class="isActiveItem( $index )"' +
                                        'ng-mouseover="hoverItem( $index )"' +
                                        'data-dropdown-result-slug="{{ result.slug }}"' +
                                        'data-dropdown-result="{{ result.title }}"' +
                                        'data-index="{{ $index }}"' +
                                        'data-length="{{ resultList.length }}">{{ result.title }}</li>' +
                                '</ul>' +
                            '</div>'

            };
        }
    ]
);
