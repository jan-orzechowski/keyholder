using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Newtonsoft.Json.Schema;
using Newtonsoft.Json.Linq;

namespace Keyholder.Models
{
    public class Level
    {
        [Key]
        public int ID { get; set; }

        [Required]
        public ApplicationUser Author { get; set; }

        [MaxLength(50)]
        public string Name { get; set; }
       
        [Required][MaxLength(5000)]
        public string LevelData { get; set; }

        [Required]
        public DateTime Created { get; set; }

        [Required]
        public DateTime LastUpdated { get; set; }        
        
        public static bool ValidateData(string levelData)
        {
            if (levelData == null) return false;
            JSchema schema = JSchema.Parse(LevelJsonSchema.Schema);
            JObject level = JObject.Parse(levelData);
            bool result = level.IsValid(schema);
            return result;
        }
    }
}