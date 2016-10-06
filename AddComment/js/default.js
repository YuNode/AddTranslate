// 有关“空白”模板的简介，请参阅以下文档:
// http://go.microsoft.com/fwlink/?LinkId=232509
(function ()
{
    "use strict";

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;

    var isUseDefaultNewWordBook = true;


    app.onactivated = function (args)
    {
        if (args.detail.kind === activation.ActivationKind.launch)
        {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated)
            {
                //TODO: 已经新启动此应用程序。请在此初始化你的应用程序。
                document.getElementById("btnOpenNewWordFile").addEventListener("click", openNewWordFile, false);
                document.getElementById("btnOpenEnglishTextFile").addEventListener("click", openEnglishTextFile, false);
                document.getElementById("btnSaveProcessedFile").addEventListener("click", saveProcessedFile, false);
                document.getElementById("btnStartAddComment").addEventListener("click", addComment1, false);
                document.getElementById("checkbox").addEventListener("click", checkboxHandle, false);

            } else
            {
                // TODO: 此应用程序已挂起，然后终止。
                // 若要创造顺畅的用户体验，请在此处还原应用程序状态，使应用似乎永不停止运行。
            }
            args.setPromise(WinJS.UI.processAll());
        }
    };

    app.oncheckpoint = function (args)
    {
        // TODO: 此应用程序将被挂起。请在此保存需要挂起中需要保存的任何状态。
        //你可以使用 WinJS.Application.sessionState 对象，该对象在挂起中会自动保存和还原。
        //如果需要在应用程序被挂起之前完成异步操作，请调用 args.setPromise()。
    };

    app.start();

    function checkboxHandle()
    {
        var checkbox = document.getElementById("checkbox");

        if (checkbox.checked == true)
        {
            console.log("选中");
            isUseDefaultNewWordBook = true;
        }
        else
        {
            console.log("不选中");
            isUseDefaultNewWordBook = false;

        }


    }

    //判断是否英文
    function isEnglish(str)
    {
        var alnum = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_  ';
        for (var i = 0; i < str.length; i++)
        {
            if (alnum.indexOf(str.charAt(i)) == -1)
            {
                return false;
            }
        }
        return true;
    }

    function handleNewWords(lines)
    {
        var arrNewWord = new Array();//储存生词的数组
        for (var i = 0; i < lines.length; i++)
        {
            var words = lines[i].split(' '); //一行中的各个单词
            var englishWord = words[0];//一行前边的英语单词
            var chineseWord = null;//一行后边的中文解释

            for (var j = 1; j < words.length; j++)
            {
                if (isEnglish(words[j]) == false)
                {
                    //不是由英文、数字组成
                    arrNewWord.push(englishWord); //确定英语单词
                    chineseWord = words[j];
                    for (var k; k < words.length; k++)
                    {
                        chineseWord = chineseWord + words[k];
                    }
                    arrNewWord.push(chineseWord);
                } else
                {
                    englishWord = englishWord + words[j];
                }
            }
            
        }
        return arrNewWord;
    }

    var arrNewWord = new Array();//储存生词的数组

    function openNewWordFile()
    {
        var openPicker = new Windows.Storage.Pickers.FileOpenPicker();
        openPicker.viewMode = Windows.Storage.Pickers.PickerViewMode.list;
        openPicker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.desktop;
        openPicker.fileTypeFilter.replaceAll([".txt"]);

        openPicker.pickSingleFileAsync().then(function (file)
        {
            if (file)
            {

                Windows.Storage.FileIO.readLinesAsync(file).then(function (contents)
                {
                    arrNewWord = handleNewWords(contents)
                });
            } else
            {
                document.getElementById("label").innerHTML = "No data";
            }
        });


    }



    var englishTextFileName = null;
    var englishTextFile = null;
    function openEnglishTextFile()
    {
        var openPicker = new Windows.Storage.Pickers.FileOpenPicker();
        openPicker.viewMode = Windows.Storage.Pickers.PickerViewMode.list;
        openPicker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.desktop;
        openPicker.fileTypeFilter.replaceAll([".txt"]);

        openPicker.pickSingleFileAsync().then(function (textFile)
        {
            if (textFile)
            {
                document.getElementById("labelEnglishTextFileName").innerHTML = textFile.name;
                englishTextFileName = textFile.name;
                englishTextFile = textFile;
                //Windows.Storage.FileIO.readLinesAsync(textFile).then(function (textLines)
                //{
                //    for (var i = 0; i < textLines.length; i++)  //遍历所有行
                //    {
                //        var words = textLines[i].split(/\s+/); //拆分行

                //        for (var j = 0; j < words.length; j++) //遍历所行中的各个单词
                //        {
                //            for (var k = 0; k < arrNewWord.length; k++)  //遍历生词本
                //            {
                //                //if ((words[i] === arrNewWord[k]) || (words[i] === arrNewWord[k] + "s") || (words[i] === arrNewWord[k] + "ed"))
                //                if ((words[j] === arrNewWord[k]))
                //                {
                //                    //textLines = textLines.replaceAll(words[i], words[i] + arrNewWord[k + 1]);
                //                    var tempStr = words[j] + arrNewWord[k + 1];
                //                    textLines[i] = textLines[i].replace(words[j], tempStr);
                //                }
                //            }

                //        }
                //        arrNewLines.push(textLines[i]);
                //    }

                //    //document.getElementById("labDebug").innerHTML = arrNewLines[0];
                //});



            } else
            {
                document.getElementById("label").innerHTML = "No data";
            }
        });
    }

   

    function addComment1()
    {
        //判断是否使用默认生词本，否是则把arrNewWord赋值为内置生词本
        if (isUseDefaultNewWordBook)
        {
            var fileUri = new Windows.Foundation.Uri('ms-appx:///Assets/vocabulary.txt');
            Windows.Storage.StorageFile.getFileFromApplicationUriAsync(fileUri).then(function (file)
            {
                if (file)
                {

                    Windows.Storage.FileIO.readLinesAsync(file).then(function (contents)
                    {
                        arrNewWord = handleNewWords(contents);
                    }).done(function ()
                    {
                        addComment2();
                    }, function () { console.log("Error:updata tile") });
                } else
                {
                    console.log("Error:read file");
                }
            });
        } else
        {
            addComment2();
        }

        
    }

    var arrNewLines = new Array();//储存添加注释后的行
    function addComment2()
    {
        Windows.Storage.FileIO.readLinesAsync(englishTextFile).then(function (textLines)
        {
            console.log(textLines[0]);
            console.log(arrNewWord[5]);
            for (var i = 0; i < textLines.length; i++)  //遍历所有行
            {
                var words = textLines[i].split(/\s+/); //拆分行

                for (var j = 0; j < words.length; j++) //遍历所行中的各个单词
                {
                    for (var k = 0; k < arrNewWord.length; k++)  //遍历生词本
                    {
                        //if ((words[i] === arrNewWord[k]) || (words[i] === arrNewWord[k] + "s") || (words[i] === arrNewWord[k] + "ed"))
                        if ((words[j] === arrNewWord[k]))
                        {
                            //textLines = textLines.replaceAll(words[i], words[i] + arrNewWord[k + 1]);
                            var tempStr = words[j] + arrNewWord[k + 1];
                            textLines[i] = textLines[i].replace(words[j], tempStr);
                        }
                    }

                }
                arrNewLines.push(textLines[i]);
            }

            
        });
    }

    function saveProcessedFile()
    {
        var processedString = arrNewLines[0] + "\r\n";
        for (var i = 1; i < arrNewLines.length; i++)
        {
            processedString = processedString + arrNewLines[i] + "\r\n";
        }
        //document.getElementById("labDebug").innerHTML = arrNewLines[0];
        // Create the picker object and set options
        var savePicker = new Windows.Storage.Pickers.FileSavePicker();
        savePicker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.documentsLibrary;
        // Dropdown of file types the user can save the file as
        savePicker.fileTypeChoices.insert("Plain Text", [".txt"]);
        // Default file name if the user does not type one in or select a file to replace

        englishTextFileName = englishTextFileName.replace(".txt", "_AddComment")
        savePicker.suggestedFileName = englishTextFileName;

        savePicker.pickSaveFileAsync().then(function (file)
        {
            if (file)
            {
                // Prevent updates to the remote version of the file until we finish making changes and call CompleteUpdatesAsync.
                Windows.Storage.CachedFileManager.deferUpdates(file);
                // write to file
                Windows.Storage.FileIO.writeTextAsync(file, processedString).done(function ()
                {
                    // Let Windows know that we're finished changing the file so the other app can update the remote version of the file.
                    // Completing updates may require Windows to ask for user input.
                    Windows.Storage.CachedFileManager.completeUpdatesAsync(file).done(function (updateStatus)
                    {
                        if (updateStatus === Windows.Storage.Provider.FileUpdateStatus.complete)
                        {
                            WinJS.log && WinJS.log("File " + file.name + " was saved.", "sample", "status");
                        } else
                        {
                            WinJS.log && WinJS.log("File " + file.name + " couldn't be saved.", "sample", "status");
                        }
                    });
                });
            } else
            {
                WinJS.log && WinJS.log("Operation cancelled.", "sample", "status");
            }
        });

    }
})();

