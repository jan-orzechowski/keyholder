using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Keyholder.Models
{
    public class EditLevelViewModel
    {
        public int ID;

        public string Name;

        public string MapString;

        public EditLevelViewModel()
        {
            ID = 0;
            Name = "Brak tytułu";
            MapString = null;
        }

        public EditLevelViewModel(Level sourceLevel)
        {
            ID = sourceLevel.ID;
            Name = sourceLevel.Name;
            MapString = sourceLevel.LevelData;
        }
    }
}