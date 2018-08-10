using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Dynamic;
using System.Web;
using System.Web.Mvc;
using System.Data.Entity;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.AspNet.Identity.EntityFramework;
using Keyholder.Models;

namespace Keyholder
{
    public static class Helpers
    {
        public static ApplicationUser GetUser(ApplicationDbContext context, string id)
        {
            return context.Users.FirstOrDefault(x => x.Id == id);
        }

        public static string GetSortingOptionName(string sortProperty, string sortOrder)
        {
            if (sortOrder == "Desc")
            {
                switch (sortProperty)
                {
                    case "Name":
                        return "Nazwa - od Z do A";
                    case "Author":
                        return "Autor - od Z do A";
                    case "Date":
                        return "Data dodania - od najnowszych";
                    case "ModDate":
                        return "Data modyfikacji - od najnowszych";
                    case "AverageRating":
                        return "Ocena - od najwyższej";
                    default:
                        return "Błąd";
                }
            }
            else if (sortOrder == "Asc")
            {
                switch (sortProperty)
                {
                    case "Name":
                        return "Nazwa - od A do Z";
                    case "Author":
                        return "Autor - od A do Z";
                    case "Date":
                        return "Data dodania - od najstarszych";
                    case "ModDate":
                        return "Data modyfikacji - od najstarszych";
                    case "AverageRating":
                        return "Ocena - od najniższej";
                    default:
                        return "Błąd";
                }
            }
            else
            {
                return "Błąd";
            }
        }

        public static string GetLevelOrderBy(string sortProperty, string sortOrder)
        {
            if (sortOrder != "Asc" && sortOrder != "Desc")
            {
                sortOrder = "Asc";
            }

            switch (sortProperty)
            {
                case "Name":
                    sortProperty = "Name";
                    break;
                case "Author":
                    sortProperty = "Author.UserName";
                    break;
                case "Date":
                    sortProperty = "Created";
                    break;
                case "ModDate":
                    sortProperty = "LastUpdated";
                    break;
                case "AverageRating":
                    sortProperty = "AverageRating";
                    break;
                default:
                    sortProperty = "Name";
                    break;
            }

            return (sortProperty + " " + sortOrder);
        }

        public static string PrintAverageRating(float? averageRating)
        {
            if (averageRating.HasValue == false)
            {
                return "Brak oceny";
            }

            string result = Math.Round(averageRating.Value, 2).ToString() + " / 5";

            return result;
        }

        public static string TruncateString(string stringToTruncate, int maxLength)
        {
            if (string.IsNullOrEmpty(stringToTruncate))
            {
                return stringToTruncate;
            }
            else
            {
                return stringToTruncate.Substring(0, Math.Min(stringToTruncate.Length, maxLength));
            }
        }
    }
}