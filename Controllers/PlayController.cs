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
                             MapID = level.ID,
                             MapName = level.Name,
                             MapString = level.LevelData,
                             AuthorName = level.Author.UserName,
                         })
                         .FirstOrDefault();

                if (model == null)
                {
                    return RedirectToRoute("BrowseLevelsDefault");
                }

                return View("Play", model);
            }
        }        

        [HttpPost]        
        [Route("Play/Rate")]
        public ActionResult Rate(int mapID, int? grade)
        {
            if (User.Identity.IsAuthenticated == false)
            {
                return RedirectToRoute("BrowseLevelsDefault");
            }

            using (var context = new ApplicationDbContext())
            {
                string currentUserID = User.Identity.GetUserId();

                Level currentLevel = (from l in context.Levels
                                      where l.ID == mapID
                                      select l)
                                      .Include(l => l.Author)
                                      .FirstOrDefault();

                if (currentLevel == null
                    || currentLevel.Author.Id == currentUserID)
                {
                    return RedirectToRoute("BrowseLevelsDefault");
                }              

                Rating rating = (from r in context.Ratings
                                 where r.LevelID == mapID
                                    && r.PlayerID == currentUserID
                                 select r)
                                .FirstOrDefault();

                if (rating == null)
                {
                    rating = new Rating()
                    {
                        LevelID = mapID,
                        PlayerID = currentUserID
                    };

                    context.Ratings.Add(rating);
                }

                if (grade != null)
                {
                    if (grade.Value < 1) grade = 1;
                    if (grade.Value > 5) grade = 5;

                    rating.Value = grade;
                }
                
                context.SaveChanges();

                currentLevel.RecalculateAverageRating(context);

                context.SaveChanges();
            }

            return RedirectToRoute("BrowseLevelsDefault");
        }
    }
}