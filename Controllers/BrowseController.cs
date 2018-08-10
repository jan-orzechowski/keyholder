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
    [RoutePrefix("Browse")]
    public class BrowseController : Controller
    {        
        [HttpGet]
        [Authorize]
        [Route("UserLevels/{name}", Name = "ShowUser")]
        public ActionResult UserLevels(string name)
        {
            UserViewModel model;

            using (var context = new ApplicationDbContext())
            {
                UserManager<ApplicationUser> manager =
                        new UserManager<ApplicationUser>(
                            new UserStore<ApplicationUser>(context));

                ApplicationUser userToView = manager.FindByName(name);

                if (userToView == null)
                {
                    return RedirectToAction("Index", "Home");
                }

                string id = userToView.Id;

                var levelDescriptions =
                    (from level in context.Levels
                     where level.Author.Id == id
                     orderby level.LastUpdated descending                    
                     select new LevelInfoViewModel
                     {
                         LevelID = level.ID,
                         Name = level.Name,
                         Created = level.Created,
                         LastUpdated = level.LastUpdated,
                         AverageRating = level.AverageRating
                     })
                    .ToList();

                model = new UserViewModel()
                {
                    Name = userToView.UserName,
                    Levels = levelDescriptions
                };

            }

            return View("UserLevels", model);
        }

        [HttpGet]
        [Route("Levels", Name = "BrowseLevelsDefault")]
        [Route("Levels/{sortProperty?}/{sortOrder?}/{pageSize?}/{page?}", Name = "BrowseLevels")]
        public ActionResult Levels(string sortProperty = "Name", string sortOrder = "Asc",
                                   int pageSize = 5, int page = 1)
        {
            if (pageSize < 5) pageSize = 5;
            if (pageSize > 100) pageSize = 100;

            BrowseLevelsViewModel model;

            using (var context = new ApplicationDbContext())
            {
                int levelsCount = context.Database.SqlQuery<int>("SELECT COUNT(1) FROM Levels").Single();

                int startingIndex = ((page - 1) * pageSize);
                int lastIndex = startingIndex + pageSize;

                var levelDescriptions =
                    (from level in context.Levels
                    .OrderBy(Helpers.GetLevelOrderBy(sortProperty, sortOrder))
                    .Skip(startingIndex)
                    .Take(lastIndex - startingIndex)
                    .AsNoTracking()
                     select new LevelInfoViewModel
                     {
                         LevelID = level.ID,
                         Name = level.Name,
                         AuthorName = level.Author.UserName,
                         Created = level.Created,
                         LastUpdated = level.LastUpdated,
                         AverageRating = level.AverageRating
                     })
                    .ToList();

                model = new BrowseLevelsViewModel()
                {
                    Levels = levelDescriptions,
                    CurrentSortProperty = sortProperty,
                    CurrentSortOrder = sortOrder,
                    PageViewer = new PageViewer(levelsCount, pageSize, page)
                };
            }

            return View("Levels", model);
        }        
    }
}