using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices.WindowsRuntime;
using System.Text;
using System.Text.RegularExpressions;
using Windows.Foundation;
using Windows.Foundation.Collections;
using Windows.Storage;
using Windows.Storage.Pickers;
using Windows.Storage.Provider;
using Windows.Storage.Streams;
using Windows.UI.Popups;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;
using Windows.UI.Xaml.Controls.Primitives;
using Windows.UI.Xaml.Data;
using Windows.UI.Xaml.Input;
using Windows.UI.Xaml.Media;
using Windows.UI.Xaml.Navigation;

//“空白页”项模板在 http://go.microsoft.com/fwlink/?LinkId=402352&clcid=0x409 上有介绍

namespace AddTranslate
{
    /// <summary>
    /// 可用于自身或导航至 Frame 内部的空白页。
    /// </summary>
    public sealed partial class MainPage : Page
    {
        List<string> strange = new List<string>(); //生词
        List<string> after = new List<string>();
        string aftertrans;
        string filename;

        public MainPage()
        {
            this.InitializeComponent();
        }

        private async void btn_opentxt_Click(object sender, RoutedEventArgs e)
        {
            
            FileOpenPicker filepicker = new FileOpenPicker();
            //默认桌面文件夹
            filepicker.SuggestedStartLocation = PickerLocationId.Desktop;
            //提交按钮的显示文字
            filepicker.CommitButtonText = "确定选择";
            //选择器可选择的文件类型
            filepicker.FileTypeFilter.Add(".txt");
            filepicker.FileTypeFilter.Add(".jpg");
            filepicker.FileTypeFilter.Add(".pdf");
            filepicker.FileTypeFilter.Add(".bmp");
            //选择器的浏览模式
            filepicker.ViewMode = PickerViewMode.Thumbnail;
            StorageFile file = await filepicker.PickSingleFileAsync();

            if (file != null)
            {
                //this.textBlock.Text = "你选择了'" + file.Path + "'文件";
                //this.textBlock1.Text = await FileIO.ReadTextAsync(file); 
            }
            IBuffer buffer = await FileIO.ReadBufferAsync(file);
            Stream stream = WindowsRuntimeBufferExtensions.AsStream(buffer);

            filename = file.Name;
            filename = filename.Replace(".txt","_AddTra");

            Encoding Utf16 = Encoding.Unicode;
            StreamReader sr = new StreamReader(stream, Utf16);
            string line;

            while ((line = sr.ReadLine()) != null)
            {
                

                string[] word = line.Split(' ');

                for (int i=0;i<word.Length;i++)
                {
                    for (int j = 0; j < strange.Count; j++)
                    {
                        if ((word[i]==strange[j])|| (word[i] == (strange[j]+"s"))|| (word[i] == (strange[j] + "ed")))
                        {
                            line = line.Replace(word[i], word[i]+ "("+strange[++j] + ")");
                        }


                    }
                }

                //MessageDialog md = new MessageDialog(line, "Title");
                //await md.ShowAsync();

                after.Add(line);
            }


        }

        private async void btnOpenStrange_Click(object sender, RoutedEventArgs e)
        {
            FileOpenPicker filepicker = new FileOpenPicker();
            //默认桌面文件夹
            filepicker.SuggestedStartLocation = PickerLocationId.Desktop;
            //提交按钮的显示文字
            filepicker.CommitButtonText = "确定选择";
            //选择器可选择的文件类型
            filepicker.FileTypeFilter.Add(".txt");
            filepicker.FileTypeFilter.Add(".jpg");
            filepicker.FileTypeFilter.Add(".pdf");
            filepicker.FileTypeFilter.Add(".bmp");
            //选择器的浏览模式
            filepicker.ViewMode = PickerViewMode.Thumbnail;
            StorageFile file = await filepicker.PickSingleFileAsync();

            if (file != null)
            {
                //this.textBlock.Text = "你选择了'" + file.Path + "'文件";
                //this.textBlock1.Text = await FileIO.ReadTextAsync(file); 
            }
            IBuffer buffer = await FileIO.ReadBufferAsync(file);
            Stream stream = WindowsRuntimeBufferExtensions.AsStream(buffer);

            Encoding Utf16 = Encoding.Unicode;
            StreamReader sr = new StreamReader(stream, Utf16);
            string line;

            while ((line = sr.ReadLine()) != null)
            {

                //MessageDialog md = new MessageDialog(line, "Title");
                //await md.ShowAsync();

                //strange.Add(line);

                string[] word = line.Split(' ');
                string eng = word[0];
                string chi;
                for (int i = 1; i < word.Length; i++)
                {
                    Regex regChina = new Regex("^[^\x00-\xFF]");
                    Regex regEnglish = new Regex("^[a-zA-Z]");
                    
                    if (regEnglish.IsMatch(word[i])==false)
                    {
                        //不是英文
                        
                        strange.Add(eng);
                        chi = word[i];
                        for (int j = i+1; j < word.Length; j++)
                        {
                            chi = chi + word[j];
                        }
                        strange.Add(chi);
                        //MessageDialog md = new MessageDialog(chi, "Title");
                        //await md.ShowAsync();
                        break;
                    }
                    else
                        eng = eng + " " + word[i];
                }

            }

        }

        private async void btnSaveFile_Click(object sender, RoutedEventArgs e)
        {
            foreach(string lin in after)
            {
                aftertrans = aftertrans + lin+ "\r\n";
            }

            FileSavePicker savepicker = new FileSavePicker();
            savepicker.SuggestedStartLocation = PickerLocationId.Desktop;
            savepicker.CommitButtonText = "保存此文件";
            savepicker.DefaultFileExtension = ".jpg";
            savepicker.FileTypeChoices.Add("Txt File", new List<string>() { ".txt" });
            savepicker.FileTypeChoices.Add("Photo View", new List<string>() { ".jpg", ".pdf" });
            savepicker.SuggestedFileName = filename;
            StorageFile file = await savepicker.PickSaveFileAsync();
            if (file != null)
            {
                CachedFileManager.DeferUpdates(file);
                await FileIO.WriteTextAsync(file, aftertrans);
                //this.tbMsg.Text = "你保存了'" + file.Name + "'文件";
                //MessageDialog md = new MessageDialog("你保存了'" + file.Name + "'文件", "Title");
                //await md.ShowAsync();
                FileUpdateStatus status = await CachedFileManager.CompleteUpdatesAsync(file);
            }

        }
    }
}
