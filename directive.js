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
        .directive('mmaQtypeGapfill', function ($log, $mmQuestionHelper, $mmUtil) {
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

                    // Set the question text.
                    question.text = content.innerHTML;

                    scope.selectAnswer = function (event) {
                        selector = "#" + event.target.id;
                        parts = selector.split(":");
                        selector = parts[0] + "\\:" + parts[1];
                        selection = document.querySelector(selector);
                        if ((selection === null) || (angular.element(selection).hasClass('readonly'))) {
                            /* selection will be null after marking/readonly */
                            return;
                        }
                        selection = angular.element(selection);
                        if (selection.hasClass('draggable')) {
                            if (selection.hasClass('picked')) {
                                /*if picked it set this must be a second
                                 * click so set it back to show as unpicked
                                 */
                                selection.removeClass('picked');
                                selection.attr('title', '');
                                document.querySelector('.qtext').style.cursor = "auto";
                                last_item_clicked = "";

                            } else {
                                /*set border to solid on all words */
                                draggables = document.querySelectorAll('.draggable');
                                draggables.forEach(function (draggable) {
                                    angular.element(draggable).css('border', 'solid 1px');
                                });
                                selection.addClass('picked');
                                selection.attr('title', 'picked');
                                selection.css('border', 'solid 0px');
                                droptargets = document.querySelectorAll('.droptarget');
                                droptargets.forEach(function (droptarget) {
                                    angular.element(droptarget).css('cursor', 'pointer');
                                });
                                last_item_clicked = event.target.innerText;
                            }
                        }

                        if (selection.hasClass('droptarget')) {
                            if (last_item_clicked !== "") {
                                selection[0].value = last_item_clicked;
                            }
                            /*set border to solid on all words */
                            draggables = document.querySelectorAll('.draggable');
                            draggables.forEach(function (draggable) {
                                angular.element(draggable).css('border', 'solid 1px');
                            });
                        }

                    };
                }
            };
        });
