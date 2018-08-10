using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;

namespace Keyholder.Models
{
    public class Rating
    {
        [Key, Column(Order = 0)]
        [ForeignKey("Player")]
        public string PlayerID { get; set; }

        public ApplicationUser Player { get; set; }

        [Key, Column(Order = 1)]
        [ForeignKey("Level")]
        public int LevelID { get; set; }

        public Level Level { get; set; }

        public int? Value { get; set; }    
    }
}