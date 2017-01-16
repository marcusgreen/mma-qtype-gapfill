// (C) Copyright 2015 Martin Dougiamas
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

angular.module('mm.addons.qtype_gapfill')
        /**
         * Directive to render a Gapfill question.
         *
         * @module mm.addons.qtype_gapfill
         * @ngdoc directive
         * @name mmaQtypeGapfill
         */
        .directive('mmaQtypeGapfill', function ($log, $mmQuestionHelper, $mmUtil, $timeout) {
            $log = $log.getInstance('mmaQtypeGapfill');
            return {
                restrict: 'A',
                priority: 100,
                templateUrl: 'addons/qtype/gapfill/template.html',
                link: function (scope) {
                    var question = scope.question,
                            questionEl,
                            content;

                    if (!question) {
                        $log.warn('Aborting because of no question received.');
                        return $mmQuestionHelper.showDirectiveError(scope);
                    }

                    questionEl = angular.element(question.html);

                    // Get question content.
                    content = questionEl[0].querySelector('.qtext');
                    if (!content) {
                        $log.warn('Aborting because of an error parsing question.', question.name);
                        return $mmQuestionHelper.showDirectiveError(scope);
                    }

                    // Remove sequencecheck and validation error.
                    $mmUtil.removeElement(content, 'input[name*=sequencecheck]');
                    $mmUtil.removeElement(content, '.validationerror');

                    // Replace Moodle's correct/incorrect classes with our own.
                    $mmQuestionHelper.replaceCorrectnessClasses(questionEl);
                    // Treat the correct/incorrect icons.
                    $mmQuestionHelper.treatCorrectnessIcons(scope, questionEl);


                    /* set all droppables to disabled but remove the faded look shown on ios */
                    draggables = content.querySelectorAll('.draggable');
                    if (draggables.length > 0) {
                        droppables = content.querySelectorAll('.droptarget');
                        for (i = 0; i < droppables.length; i++) {
                            droppables[i].disabled = "true";
                            angular.element(droppables[i]).css('-webkit-opacity', '1');
                        }
                    }

                    // Set the question text.
                    question.text = content.innerHTML;

                    function getEl(event) {
                        selector = "#" + event.target.id;
                        parts = selector.split(":");
                        element = parts[0] + "\\:" + parts[1];
                        element = document.querySelector(element);
                        return element;
                    }
                    function deselect(selection) {
                        /*set border to solid on all draggable words */
                        draggables = document.querySelectorAll('.draggable');
                        for (i = 0; i < draggables.length; i++) {
                            if(draggables[i]===selection) continue;
                            angular.element(draggables[i]).css('border', 'solid 1px');
                            angular.element(draggables[i]).attr('title', '');
                            angular.element(draggables[i]).removeClass('picked');
                        }
                    }
                    scope.selectAnswer = function (event) {
                        selectedel = getEl(event);
                        if ((selectedel === null) || (angular.element(selectedel).hasClass('readonly'))) {
                            /* selection will be null after marking/readonly */
                            last_item_clicked = "";
                            return;
                        }

                        selection = angular.element(selectedel);
                        if (selection.hasClass('draggable')) {
                            deselect(selection);
                            if (selection.hasClass('picked')) {
                                /*if picked it set this must be a second
                                 * click so set it back to show as unpicked
                                 */
                                deselect();
                                last_item_clicked = "";
                            } else {
                                /* apply the classes and set the 
                                 * value to be copied into the gap */
                                selection.addClass('picked');
                                selection.attr('title', 'picked');
                                selection.css('border', 'solid 0px');
                                last_item_clicked = event.target.innerText;
                            }
                        }

                        if (selection.hasClass('droptarget')) {
                            /* put the selected value into the gap */
                            selection[0].value = last_item_clicked;
                            angular.element(selection[0]).css('text-align','center');
                            last_item_clicked = "";
                            deselect();
                        }

                    };
                }
            };
        });