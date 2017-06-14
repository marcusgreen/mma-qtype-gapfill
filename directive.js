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
                            questiontext;

                    if (!question) {
                        $log.warn('Aborting because of no question received.');
                        return $mmQuestionHelper.showDirectiveError(scope);
                    }

                    questionEl = angular.element(question.html);
                    questionEl = questionEl[0] || questionEl;
                    
                    
                
                    
                    // Replace Moodle's correct/incorrect and feedback classes with our own.
                    /*$mmQuestionHelper.replaceCorrectnessClasses(questionEl);
                    $mmQuestionHelper.replaceFeedbackClasses(questionEl);*/


                    // Get question questiontext.
                    questiontext = questionEl.querySelector('.qtext');
                        // Remove sequencecheck and validation error.
                    $mmUtil.removeElement(questiontext, 'input[name*=sequencecheck]');
                    $mmUtil.removeElement(questiontext, '.validationerror');
                    
                    // Get answeroptions/draggables.
                    answeroptions = questionEl.querySelector('.answeroptions');

                    if(questionEl.querySelector('.readonly') != null){
                        question.readonly = true;
                    }
                    
                    if(questionEl.querySelector('.feedback') !=null){
                        question.feedback= questionEl.querySelector('.feedback');
                        question.feedbackHTML=true;
                    }

              
                    /* set all droppables to disabled but remove the faded look shown on ios
                     * This prevents the keyboard popping up when a droppable is dropped onto
                     * a droptarget.  
                     */
                    if (answeroptions !== null) {
                        droptargets = questiontext.querySelectorAll('.droptarget');
                        for (i = 0; i < droptargets.length; i++) {
                            droptargets[i].disabled = "true";
                            angular.element(droptargets[i]).css('-webkit-opacity', '1');
                        }
                    }

                    // Set the question text.
                    question.text = questiontext.innerHTML;

                    // Set the answer options.
                    question.answeroptions = answeroptions.innerHTML;

                    function getEl(event) {
                        selector = "#" + event.target.id;
                        parts = selector.split(":");
                        element = parts[0] + "\\:" + parts[1];
                        element = document.querySelector(element);
                        return element;
                    }
                    
                    function deselect(selection) {
                        /*set border to solid on all draggable words 
                         * because document is used here instead of 
                         * someting more specific, every draggable/optionanswer
                         * will be deselected. But that is OK, because if 
                         * there is a deselection everything should be deselected
                         * e.g. on a multi question page
                         */
                        draggables = document.querySelectorAll('.draggable');
                        for (i = 0; i < draggables.length; i++) {
                            if (draggables[i] === selection)
                                continue;
                            angular.element(draggables[i]).attr('title', '');
                            angular.element(draggables[i]).removeClass('picked');
                            angular.element(draggables[i]).addClass('notpicked');

                        }
                    }
                    scope.selectAnswer = function (event) {
                        /*if the question is in a readonly state, e.g. after being
                         * answered or in the review page then stop any further 
                         * selections.
                         */
                        if (question.readonly == true) {
                            return;
                        }
                        selectedel = getEl(event);
                        if ((selectedel === null) || (angular.element(selectedel).hasClass('readonly'))) {
                            /* selection will be null after marking/readonly */
                            last_item_clicked = "";
                            /*a click away from any draggables should deselect them all */
                            deselect();
                            return;
                        }

                        selection = angular.element(selectedel);
                        if (selection.hasClass('draggable')) {
                            /* Only select if a different item has been clicked. 
                             * if the same item is clicked twice in a row it will
                             * toggle off. This is how many people expect a button
                             * to work, i.e. toggle on toggle off
                             * */
                            if (typeof last_item_clicked !== "undefined") {
                                if (selection[0].innerText != last_item_clicked) {
                                    deselect(selection);
                                }
                            }
                            if (selection.hasClass('picked')) {
                                /*if picked it set this must be a second
                                 * click so set it backx to show as unpicked
                                 */
                                deselect();
                                last_item_clicked = "";
                            } else {
                                /* apply the classes and set the 
                                 * value to be copied into the gap */
                                selection.addClass('picked');
                                selection.removeClass('notpicked');
                                selection.attr('title', 'picked');
                                last_item_clicked = event.target.innerText;
                            }
                        }

                        if (selection.hasClass('droptarget')) {
                            if (question.readonly == true) {
                                return;
                            }
                            /* put the selected value into the gap */
                            selection[0].value = last_item_clicked;
                            angular.element(selection[0]).css('text-align', 'center');
                            last_item_clicked = "";
                            deselect();
                        }

                    };
                    $timeout(function () {
                        /*set isdragdrop to true if it is a dragdrop question. This will then be used
                         * in template.html to determine when to show the  blue "tap to select..." prompt
                         */
                        if(questionEl.querySelectorAll('.draggable') != null){
                            question.isdragdrop = true;
                        }
                        if(questionEl.querySelector('#gapfill_optionsaftertext') != null){
                             question.optionsaftertext = true;
                        }
                        gapfillreadonly = questionEl.querySelectorAll('.readonly');
                        if (gapfillreadonly.length > 0) {
                            question.readonly = true;
                        }

                    });
                }
            };
        });