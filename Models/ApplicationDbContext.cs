using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data.Entity;
using System.Data.Common;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using MySql.Data.Entity;
using System.Data.Entity.Migrations;

namespace Keyholder.Models
{
    [DbConfigurationType(typeof(MySqlEFConfiguration))]
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext() : base("KeyholderConnectionString", throwIfV1Schema: false)
        {
            Database.SetInitializer(new MySqlInitializer());
        }

        public static ApplicationDbContext Create()
        {
            return new ApplicationDbContext();
        }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            if (modelBuilder == null)
            {
                throw new ArgumentNullException("modelBuilder");
            }

            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<ApplicationUser>().Property(u => u.UserName).HasMaxLength(128);
            modelBuilder.Entity<ApplicationUser>().Property(u => u.Email).HasMaxLength(128);
            modelBuilder.Entity<IdentityRole>().Property(r => r.Name).HasMaxLength(128);
        }

        public virtual DbSet<Level> Levels { get; set; }
    }   
}