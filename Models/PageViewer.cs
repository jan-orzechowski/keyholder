using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Keyholder.Models
{
    public class PageViewer
    {
        public int TotalPages;
        public int CurrentPage;
        public int FirstPageOnList;
        public int LastPageOnList;
        public int PageSize;

        public PageViewer(int itemsCount, int pageSize, int currentPage)
        {
            TotalPages = (int)Math.Ceiling((decimal)itemsCount / (decimal)pageSize);
            CurrentPage = currentPage;
            PageSize = pageSize;

            FirstPageOnList = CurrentPage - 5;
            LastPageOnList = CurrentPage + 4;

            if (FirstPageOnList <= 0)
            {
                LastPageOnList -= (FirstPageOnList - 1);                
                FirstPageOnList = 1;
            }

            if (LastPageOnList > TotalPages)
            {
                LastPageOnList = TotalPages;
                if (LastPageOnList > 10)
                {
                    FirstPageOnList = LastPageOnList - 9;
                }
            }
        }
    }
}