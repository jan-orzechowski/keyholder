using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Keyholder.Models
{
    public class LevelInfoViewModel
    {
        public int LevelID;
        public string Name;
        public string AuthorName;
        public DateTime Created;
        public DateTime LastUpdated;
        public int? AverageRating;
    }
}