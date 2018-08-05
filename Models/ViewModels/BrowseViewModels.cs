using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Keyholder.Models
{
    public class BrowseLevelsViewModel
    {
        public List<LevelInfoViewModel> Levels;
        public PageViewer PageViewer;
        public string CurrentSortProperty;
        public string CurrentSortOrder;

        public string GetCurrentSortingOptionName()
        {
            return Helpers.GetSortingOptionName(CurrentSortProperty, CurrentSortOrder);
        }        
    }    
}