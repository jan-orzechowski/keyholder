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
    public class PlayController : Controller
    {
        [HttpGet]
        [Route("Play/{mapID}", Name = "Play")]
        public ActionResult Play(int mapID)
        {
            var model = new PlayLevelViewModel();

            using (var context = new ApplicationDbContext())
            {
                model = (from level in context.Levels
                         where level.ID == mapID
                         select new PlayLevelViewModel()
                         {
                             ID = level.ID,
                             Name = level.Name,
                             MapString = level.LevelData,
                         })
                         .FirstOrDefault();

                if (model == null)
                {
                    // błąd
                    return null;
                }

                // spr. czy użytkownik jest zalogowany
                model.AuthorizedUser = true;

                return View("Play", model);
            }
        }        
    }
}