using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Dynamic;
using System.Web;
using System.Web.Mvc;
using System.Data.Entity;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Keyholder.Models;

namespace Keyholder.Controllers
{
    public class EditController : Controller
    {
        [HttpGet]
        [Authorize]
        [Route("Edit/New", Name = "New")]
        public ActionResult NewLevel()
        {
            EditLevelViewModel model = new EditLevelViewModel();
            return View("Editor", model);
        }

        [HttpGet]
        [Authorize]
        [Route("Edit/{mapID}", Name = "Edit")] 
        public ActionResult EditLevel(int mapID)
        {
            Level levelToEdit;
            using (var context = new ApplicationDbContext())
            {
                levelToEdit = context.Levels.Find(mapID);
            }

            if (levelToEdit == null)
            {
                return View("Editor", null);
            }
            else
            {
                EditLevelViewModel model = new EditLevelViewModel(levelToEdit);
                return View("Editor", model);
            }
        }

        [HttpPost]
        [Authorize]
        [Route("Edit/Save")]
        public ActionResult Save(string mapString, string name, int currentMapID)
        {
            int mapIDToReturn = currentMapID;

            bool isValid = Level.ValidateData(mapString);
            if (isValid == false)
            {
                return Json(new { mapID = 0 });
            }

            Helpers.TruncateString(name, 50);

            using (ApplicationDbContext context = new ApplicationDbContext())
            {
                ApplicationUser currentUser = Helpers.GetUser(context, User.Identity.GetUserId());
                if (currentUser == null)
                {
                    return Json(new { mapID = 0 });
                }

                if (currentMapID == 0)
                {
                    // Nowa mapa
                    
                    Level newLevel = new Level
                    {
                        Name = name,
                        Created = DateTime.UtcNow,
                        LastUpdated = DateTime.UtcNow,
                        LevelData = mapString,
                        Author = currentUser
                    };
                    
                    context.Levels.Add(newLevel);

                    context.SaveChanges();

                    return Json(new { mapID = newLevel.ID });
                }
                else
                {
                    // Istniejąca mapa

                    Level levelToModify = context.Levels
                        .Where(x => x.ID == currentMapID)
                        .Include(x => x.Author)
                        .First();

                    if (levelToModify == null
                        || levelToModify.Author != currentUser)
                    {
                        return Json(new { mapID = 0 });
                    }

                    levelToModify.Name = name;
                    levelToModify.LevelData = mapString;
                    levelToModify.LastUpdated = DateTime.UtcNow;

                    context.SaveChanges();

                    return Json(new { mapID = mapIDToReturn });
                }
            }
        }
    }
}